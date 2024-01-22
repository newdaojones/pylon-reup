import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { AssetTransfer } from "@src/server/models/AssetTransfer";
import { Charge } from "@src/server/models/Charge";
import { Checkout } from "@src/server/models/Checkout";
import { CheckoutRequest } from "@src/server/models/CheckoutRequest";
import { User } from "@src/server/models/User";
import { log } from "@src/server/utils";
import { normalizeOrder } from "@src/server/utils/convert";

export default handler(
  allowMethods(["GET"]),
  authMiddlewareForPartner,
  async (req, res) => {
    const id = req.query.id;
    const partner = req.partner;

    log.info(
      {
        func: "/partners/orders/:id",
        id,
        partnerId: partner?.id,
      },
      "Start get partner single order"
    );

    try {
      const checkoutRequest = await CheckoutRequest.findOne({
        where: {
          partnerId: partner.id,
          id,
        },
        include: [
          {
            model: Checkout,
            include: [
              {
                model: Charge,
              },
              {
                model: AssetTransfer,
              },
              {
                model: User,
              },
            ],
          },
        ],
      });

      res.status(200).json(normalizeOrder(checkoutRequest));
    } catch (error: any) {
      log.warn(
        {
          func: "/partners/orders/:id",
          id,
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
  }
);
