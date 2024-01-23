import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { KycLink } from "@src/server/models/KycLink";
import { Partner } from "@src/server/models/Partner";
import { BridgeService } from "@src/server/services/bridgeService";
import { log } from "@src/server/utils";
import { normalizeStatus } from "@src/server/utils/convert";
import { check, validationResult } from "express-validator";

const bridgeService = BridgeService.getInstance();

export default handler(allowMethods(["POST"]), async (req, res) => {
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
});
