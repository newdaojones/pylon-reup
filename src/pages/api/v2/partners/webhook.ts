import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { log } from "@src/server/utils";
import { check, validationResult } from "express-validator";

export default handler(
  allowMethods(["POST"]),
  authMiddlewareForPartner,
  async (req, res) => {
    const partner = req.partner;
    const webhook = req.body.webhook;

    log.info({
      func: "partners/webhook",
      webhook,
      partnerId: partner?.id,
    });
    try {
      await check("webhook", "Webhook url is required").notEmpty().run(req);
      await check("webhook", "Webhook url is invalid").isURL().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.throw();
      }

      if (!partner) {
        throw new Error("Partner not found");
      }

      await partner.update({
        webhook,
      });

      res.status(200).send({
        message: "success",
      });
    } catch (error: any) {
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
  }
);
