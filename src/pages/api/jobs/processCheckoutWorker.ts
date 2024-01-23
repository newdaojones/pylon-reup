import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { Checkout } from "@src/server/models/Checkout";
import { PaidStatus } from "@src/server/types/paidStatus.type";
import { CheckoutService } from "@src/server/services/checkout";
import { log } from "@src/server/utils";
const checkoutService = CheckoutService.getInstance();

export default handler(allowMethods(["GET"]), async (req, res, next) => {
  try {
    const checkouts = await Checkout.findAll({
      where: {
        status: PaidStatus.Pending,
      },
    });

    const result: any = {
      success: [],
      failed: [],
    };

    for (const checkout of checkouts) {
      try {
        await checkoutService.processCheckout(checkout);

        result.success.push(checkout.id);
      } catch (err) {
        log.warn(
          {
            func: "/jobs/processCheckoutWorker",
            checkoutId: checkout.id,
          },
          "Failed process checkout"
        );
        result.failed.push(checkout.id);
      }
    }

    log.info(
      {
        func: "/jobs/processCheckoutWorker",
        result,
      },
      "Checkout Info"
    );

    return res.status(200).json({
      result,
    });
  } catch (err: any) {
    log.warn(
      {
        func: "/jobs/processCheckoutWorker",
        err,
      },
      "failed sync"
    );

    res.status(400).send({
      message: err.message || "Error",
    });
  }
});
