import { Config } from "@src/server/config";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { KycLink } from "@src/server/models/KycLink";
import { Partner } from "@src/server/models/Partner";
import { BridgeService } from "@src/server/services/bridgeService";
import { CustomNextApiRequest } from "@src/server/types/request.type";
import { log } from "@src/server/utils";
import { normalizeStatus } from "@src/server/utils/convert";
import { check, validationResult } from "express-validator";
import { NextApiResponse } from "next";

const bridgeService = BridgeService.getInstance();

const createPartner = async (
  req: CustomNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body;

  log.info({
    func: "partners",
    data,
  });

  try {
    await check("firstName", "First name is required").notEmpty().run(req);
    await check("lastName", "Last name is required").notEmpty().run(req);
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is invalid").isEmail().run(req);
    await check("password", "Password is required").notEmpty().run(req);
    await check("password", "Please set strong password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .run(req);
    await check("companyName", "Company name is required").notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.throw();
    }

    const existingUserEmail = await Partner.findOne({
      where: {
        email: data.email,
      },
    });

    if (existingUserEmail) {
      throw new Error(`Already exists account with email: ${data.email}`);
    }

    const partner = await Partner.sequelize.transaction(async (t) => {
      const partner = await Partner.create(
        {
          ...data,
        },
        { transaction: t }
      );

      const response = await bridgeService.createKycLink({
        idempotencyKey: partner.id,
        name: partner.name,
        email: partner.email,
        type: "business",
      });

      const kycLink = await KycLink.create(
        {
          id: response.id,
          userId: partner.id,
          email: response.email,
          type: response.type,
          kycLink: response.kyc_link,
          tosLink: response.tos_link,
          kycStatus: normalizeStatus(response.kyc_status),
          tosStatus: response.tos_status,
          associatedObjectType: "kycLink",
          associatedUserType: "partner",
        },
        { transaction: t }
      );

      return {
        id: partner.id,
        kycLink: kycLink.kycLink,
        tosLink: kycLink.tosLink,
      };
    });

    res.status(201).json({
      ...partner,
      message: "Created your account successfully.",
    });
  } catch (err: any) {
    log.warn(
      {
        func: "partners",
        data,
        err,
      },
      "Failed create partner"
    );

    if (err.mapped && err.mapped()) {
      return res.status(422).send({
        message: "Failed validation",
        errors: err.mapped(),
      });
    }

    if (err.code) {
      return res.status(400).send(err);
    }

    res.status(400).send({
      message: err.message,
    });
  }
};

const updatePartner = async (
  req: CustomNextApiRequest,
  res: NextApiResponse
) => {
  const partner = req.partner;
  const { webhook, displayName, fee } = req.body;

  log.info({
    func: "partners/partners",
    webhook,
    displayName,
    partnerId: partner?.id,
    fee,
  });
  try {
    if (!partner) {
      throw new Error("Partner not found");
    }

    await check("webhook", "Webhook url is invalid")
      .optional()
      .isURL()
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.throw();
    }

    if (fee !== undefined && fee < Config.defaultFee.minFee) {
      throw new Error(
        `The fee should greater than or equal to ${Config.defaultFee.minFee}%`
      );
    }

    await partner.update({
      fee,
      webhook,
      displayName,
    });

    res.status(200).send({
      message: "success",
    });
  } catch (error: any) {
    log.info(
      {
        func: "partners",
        webhook,
        displayName,
        partnerId: partner?.id,
      },
      "Failed Update Partner"
    );

    if (error.mapped && error.mapped()) {
      return res.status(422).send({
        message: "Failed validation",
        errors: error.mapped(),
      });
    }

    if (error.code) {
      return res.status(400).send(error);
    }

    res.status(400).send({
      message: error.message || "Error",
    });
  }
};

export default handler(allowMethods(["POST", "PATCH"]), async (req, res) => {
  if (req.method === "POST") {
    return createPartner(req, res);
  }

  return updatePartner(req, res);
});
