import { Config } from "@src/server/config";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { KycLink } from "@src/server/models/KycLink";
import { Partner } from "@src/server/models/Partner";
import { TosStatus } from "@src/server/types/tosStatus.type";
import { UserStatus } from "@src/server/types/userStatus.type";
import { log } from "@src/server/utils";

export default handler(
  allowMethods(["POST"]),
  authMiddlewareForPartner,
  async (req, res) => {
    const partner = req.partner;

    try {
      if (Config.isProduction) {
        throw new Error("Not allowed sandbox on production");
      }

      const partnerRecord = await Partner.findByPk(partner.id);

      await partnerRecord.update({
        status: UserStatus.Active,
      });

      const kycLink = await KycLink.findOne({
        where: {
          userId: partner.id,
        },
      });

      if (kycLink) {
        await kycLink.update({
          kycStatus: UserStatus.Active,
          tosStatus: TosStatus.Approved,
        });
      }

      await partnerRecord.sendWebhook(partner.id, "account", "update", {
        id: partnerRecord.id,
        firstName: partnerRecord.firstName,
        lastName: partnerRecord.lastName,
        email: partnerRecord.email,
        phoneNumber: partnerRecord.phoneNumber,
        ssn: partnerRecord.ssn,
        dob: partnerRecord.dob,
        status: partnerRecord.status,
        streetAddress: partnerRecord.streetAddress,
        streetAddress2: partnerRecord.streetAddress2,
        city: partnerRecord.city,
        postalCode: partnerRecord.postalCode,
        state: partnerRecord.state,
        country: partnerRecord.country,
      });

      return res.status(200).json({ message: "Approved your account" });
    } catch (err: any) {
      log.warn(
        {
          func: "/partners/kyb_success/sandbox",
          err,
        },
        "Failed approve KYB"
      );

      if (err.code) {
        return res.status(400).send(err);
      }

      res.status(400).send({
        message: err.message || "Error",
      });
    }
  }
);
