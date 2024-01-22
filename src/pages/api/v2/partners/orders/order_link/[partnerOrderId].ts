import { Config } from "@src/server/config";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { CheckoutRequest } from "@src/server/models/CheckoutRequest";
import { log } from "@src/server/utils";

export default handler(
  allowMethods(["GET"]),
  authMiddlewareForPartner,
  async (req, res) => {
    const partnerOrderId = req.query.partnerOrderId;
    const partner = req.partner;

    log.info(
      {
        func: "/v2/partners/orders/order_link/:partnerOrderId",
        partnerOrderId,
        partnerId: partner?.id,
      },
      "Start get partner order link"
    );

    try {
      const checkoutRequest = await CheckoutRequest.findOne({
        where: {
          partnerId: partner.id,
          partnerOrderId,
        },
      });

      if (!checkoutRequest) {
        return res.status(200).json({});
      }

      res.status(200).json({
        uri: `${Config.frontendUri}/${checkoutRequest.id}`,
      });
    } catch (error: any) {
      log.warn(
        {
          func: "/v2/partners/orders/order_link/:partnerOrderId",
          partnerOrderId,
          partnerId: partner?.id,
          err: error,
        },
        "Failed get partner orders"
      );

      if (error.code) {
        return res.status(400).send(error);
      }

      res.status(400).send({
        message: error.message || "Error",
      });
    }
  }
);
