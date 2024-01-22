import { Config } from "@src/server/config";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { CheckoutRequest } from "@src/server/models/CheckoutRequest";
import { CustomNextApiRequest } from "@src/server/types/request.type";
import { log } from "@src/server/utils";
import { normalizeOrder } from "@src/server/utils/convert";
import { check, validationResult } from "express-validator";
import { NextApiResponse } from "next";
import { WhereOptions } from "sequelize";

const createOrder = async (req: CustomNextApiRequest, res: NextApiResponse) => {
  const data = req.body;
  const partner = req.partner;

  log.info(
    {
      func: "/partners/orders",
      data,
      partnerId: partner?.id,
    },
    "Start create partner order"
  );

  try {
    await check("phoneNumber", "Phone number is invalid")
      .optional()
      .isMobilePhone("en-US")
      .run(req);
    await check("email", "Email address is invalid")
      .optional()
      .isEmail()
      .run(req);
    await check("amount", "Amount is required").notEmpty().run(req);
    await check("amount", "Amount should numeric").isNumeric().run(req);
    await check("walletAddress", "Wallet address is required")
      .notEmpty()
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.throw();
    }

    if (!partner.isApproved) {
      throw new Error("Your account is not approved yet. please wait.");
    }

    const checkoutRequest = await CheckoutRequest.generateCheckoutRequest({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      streetAddress: data.streetAddress,
      streetAddress2: data.streetAddress2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      amount: data.amount,
      walletAddress: data.walletAddress,
      partnerOrderId: data.partnerOrderId,
      fee: partner.fee,
      feeType: partner.feeType,
      feeMethod: partner.feeMethod,
      partnerId: partner.id,
    });
    res.status(200).json({
      id: checkoutRequest.id,
      uri: `${Config.frontendUri}/${checkoutRequest.id}`,
    });
  } catch (error: any) {
    log.warn(
      {
        func: "/partners/orders",
        data,
        partnerId: partner?.id,
        err: error,
      },
      "Failed create partner order"
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

const getOrders = async (req: CustomNextApiRequest, res: NextApiResponse) => {
  const data = req.query;
  const partner = req.partner;

  log.info(
    {
      func: "/partners/orders",
      data,
      partnerId: partner?.id,
    },
    "Start get partner orders"
  );

  try {
    await check("offset", "Offset is required").notEmpty().run(req);
    await check("offset", "Offset is invalid").isInt().run(req);
    await check("limit", "Limit is required").notEmpty().run(req);
    await check("limit", "Limit is invalid").isInt().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.throw();
    }

    const status = data.status as string;
    const offset = data.offset ? Number(data.offset) : 0;
    const limit = Math.min(data.limit ? Number(data.limit) : 10, 50);

    const checkoutRequestCriteria: WhereOptions = {
      partnerId: partner.id,
    };

    if (data.status) {
      checkoutRequestCriteria.status = data.status as string;
    }

    const checkoutRequests = await CheckoutRequest.scope(
      "checkout"
    ).findAndCountAll({
      where: checkoutRequestCriteria,
      distinct: true,
      offset,
      limit,
    });

    const rows = checkoutRequests.rows.map((request) =>
      normalizeOrder(request)
    );

    res.status(200).json({
      rows,
      count: checkoutRequests.count,
    });
  } catch (error: any) {
    log.warn(
      {
        func: "/partners/orders",
        data,
        partnerId: partner?.id,
        err: error,
      },
      "Failed get partner orders"
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

export default handler(
  allowMethods(["POST", "GET"]),
  authMiddlewareForPartner,
  async (req, res) => {
    if (req.method === "POST") {
      return createOrder(req, res);
    }

    return getOrders(req, res);
  }
);
