import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { Partner } from "@src/server/models/Partner";
import { UserService } from "@src/server/services/userService";
import { check, validationResult } from "express-validator";
import passport from "passport";

export default handler(allowMethods(["POST"]), async (req, res, next) => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password cannot be blank").notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).send("Validation failed");
  }

  return passport.authenticate(
    "local",
    async (err: Error, user: any, info: any) => {
      if (err || info) {
        return res.status(401).send(err?.message || info?.message || err);
      }

      if (!user) {
        return res.status(401).send("Invalid email or password");
      }

      return res.status(202).json(
        UserService.generateJWTToken({
          id: user.id,
          email: user.email,
        })
      );
    }
  )(req, res, next);
});
