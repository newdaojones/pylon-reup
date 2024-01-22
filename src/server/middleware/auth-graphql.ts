import passport from "passport";
import { Middleware } from "./handler";
import { User } from "../models/User";

const trimUser = (user: User) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    isVerified: user.isVerified,
  };
};

export const authMiddlewareForGraphql: Middleware = async (req, res, next) => {
  passport.authenticate(
    "bearer-validate",
    { session: false },
    (err: any, data: any, info: any) => {
      if (data && data.user) {
        req.user = trimUser(data.user);
      }

      console.log("here------------");

      next();
    }
  )(req, res, next);
};
