import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForPartner } from "@src/server/middleware/auth-partner";
import { User } from "@src/server/models/User";
import { CustomNextApiRequest } from "@src/server/types/request.type";
import { log } from "@src/server/utils";
import { NextApiResponse } from "next";

const getUser = async (req: CustomNextApiRequest, res: NextApiResponse) => {
  try {
    const id = req.query.id as string;

    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("Not found User");
    }

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dob: user.dob,
      ssn: user.ssn,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      country: user.country,
      isVerified: user.isVerified,
      status: user.status,
    });
  } catch (err: any) {
    log.warn(
      {
        func: "/partners/users/:id",
        err,
      },
      "Failed get user"
    );

    res.status(400).send({
      message: err.message || "Error",
    });
  }
};

const updateUser = async (req: CustomNextApiRequest, res: NextApiResponse) => {
  const partner = req.partner;
  const id = req.query.id as string;
  const data = req.body;

  log.info(
    {
      func: "PATCH: /users/orders",
      partnerId: partner?.id,
      id,
      data,
    },
    "Start updating user"
  );
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error(`Can\'t find a user for ID: ${id}`);
    }

    await user.update({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      streetAddress: data.streetAddress,
      streetAddress2: data.streetAddress2,
      city: data.city,
      state: data.state,
      ssn: data.ssn,
      dob: data.dob,
    });

    await user.sendWebhook("update");

    res.status(200).send(user.toJSON());
  } catch (error: any) {
    log.info(
      {
        func: "PATCH: /users/orders",
        partnerId: partner?.id,
        id,
        data,
      },
      "Failed Update Partner"
    );

    if (error.code) {
      return res.status(400).send(error);
    }

    res.status(400).send({
      message: error.message || "Error",
    });
  }
};

export default handler(
  allowMethods(["GET", "PATCH"]),
  authMiddlewareForPartner,
  async (req, res) => {
    if (req.method === "PATCH") {
      return updateUser(req, res);
    }

    return getUser(req, res);
  }
);
