import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { log } from "@src/server/utils";
import { KycService } from "@src/server/services/kycService";
const kycService = KycService.getInstance();

export default handler(allowMethods(["GET"]), async (req, res, next) => {
  try {
    await kycService.syncKycIn2Days();

    return res.status(200).json({
      message: "synced",
    });
  } catch (err: any) {
    log.warn(
      {
        func: "/jobs/syncKycIn2Days",
        err,
      },
      "failed sync"
    );

    res.status(400).send({
      message: err.message || "Error",
    });
  }
});
