import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { UserService } from "@src/server/services/userService";
import { check, validationResult } from "express-validator";
import { Partner } from "@src/server/models/Partner";

export default handler(allowMethods(["POST"]), async (req, res) => {
  try {
    await check("email", "Email is invalid").optional().isEmail().run(req);
    await check("password", "Password cannot be blank").notEmpty().run(req);
    await check("password", "Please set strong password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.throw();
    }

    const { email, password } = req.body;
    const ipAddresses = (req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress) as string;
    const ipAddress = ipAddresses.split(",")[0];
    const userAgent = req.headers["user-agent"];

    const partner = await Partner.findPartner(email, password);

    if (!partner) {
      throw new Error("Invalid email or password");
    }

    const token = await UserService.generateJWTToken({
      id: partner.id,
      email: partner.email,
      ipAddress,
      userAgent,
    });

    return res.status(202).json({ token });
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
});
