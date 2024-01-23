import * as pg from "pg";

import { Sequelize, SequelizeOptions } from "sequelize-typescript";

const sequelizeConfig: SequelizeOptions = require("../sequelize/config");
import { IDbModels } from "./models";
import { AgreementLink } from "./AgreementLink";
import { Checkout } from "./Checkout";
import { CheckoutRequest } from "./CheckoutRequest";
import { AssetTransfer } from "./AssetTransfer";
import { KycLink } from "./KycLink";
import { Charge } from "./Charge";
import { User } from "./User";
import { Partner } from "./Partner";
import { Setting } from "./Setting";
import { CoinRate } from "./CoinRate";

const sequelize = new Sequelize({
  ...sequelizeConfig,
  dialectModule: pg,
});

sequelize.addModels([
  AgreementLink,
  Checkout,
  CheckoutRequest,
  AssetTransfer,
  KycLink,
  Charge,
  User,
  Partner,
  Setting,
  CoinRate,
]);

type ISequelize = IDbModels & { sequelize: Sequelize };
const db = <ISequelize>(<unknown>sequelize.models);

db.sequelize = sequelize;

export default db;
