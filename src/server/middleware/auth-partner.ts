import * as jwt from "jsonwebtoken";

import { Middleware } from "./handler";
import { Config } from "../config";
import { log } from "../utils";
import { Partner } from "../models/Partner";

export const authMiddlewareForPartner: Middleware = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      message: "Authentication is required!",
    });
    return;
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, Config.jwtSecret, async (err: any, decoded: any) => {
    if (err) {
      const message =
        err.message === "jwt expired"
          ? "Token expired, please login"
          : err.message;
      res.status(401).json({
        message,
      });
      return;
    }

    const ipAddresses = (req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress) as string;
    const ipAddress = ipAddresses.split(",")[0];
    var userAgent = req.headers["user-agent"];

    if (decoded.ipAddress !== ipAddress) {
      log.info(
        {
          func: "authMiddlewareForPartner",
          ipAddress,
          decoded,
        },
        "Mismatch ip address"
      );
      res.status(401).json({
        message: "Failed Authentication",
      });
      return;
    }

    if (decoded.userAgent !== userAgent) {
      log.info(
        {
          func: "authMiddlewareForPartner",
          userAgent,
          decoded,
        },
        "Mismatch user agent"
      );

      res.status(401).json({
        message: "Failed Authentication",
      });
      return;
    }

    const partner = await Partner.findOne({ where: { id: decoded.id } });

    if (!partner) {
      res.status(401).json({
        message: "Partner not found, please login",
      });
      return;
    }

    // if (!partner.isApproved) {
    //   res.status(422).json({
    //     message: 'Your account is not approved yet. please wait.',
    //   });
    // }

    req.partner = partner;

    next();
  });
};
