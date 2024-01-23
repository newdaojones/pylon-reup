import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { KycLink } from "@src/server/models/KycLink";
import { log } from "@src/server/utils";

export default handler(
  allowMethods(["GET"]),
  authMiddlewareForPartner,
  async (req, res) => {
    try {
      const partner = req.partner;
      const kycLink = await KycLink.findOne({
        where: {
          associatedUserType: "partner",
          userId: partner.id,
        },
      });

      if (!kycLink) {
        throw new Error("Not found kyc link");
      }

      return res.status(200).json({ link: kycLink.kycLink });
    } catch (err: any) {
      log.warn(
        {
          func: "/partners/kyb_link",
          err,
        },
        "Failed get tos link"
      );

      if (err.mapped && err.mapped()) {
        return res.status(422).send({
          message: "Failed validation",
          errors: err.mapped(),
        });
      }

      res.status(400).send({
        message: err.message || "Error",
      });
    }
  }
);
