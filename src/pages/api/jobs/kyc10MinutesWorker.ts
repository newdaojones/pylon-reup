import "@src/server/models";

import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { log } from "@src/server/utils";
import { KycService } from "@src/server/services/kycService";
const kycService = KycService.getInstance();

export default handler(allowMethods(["GET"]), async (req, res, next) => {
  try {
    await kycService.syncKycIn10Minutes();

    return res.status(200).json({
      message: "synced",
    });
  } catch (err: any) {
    log.warn(
      {
        func: "/jobs/kyc10MinutesWorker",
        err,
      },
      "failed sync"
    );

    res.status(400).send({
      message: err.message || "Error",
    });
  }
});
