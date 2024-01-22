import { CheckoutRequest } from "./CheckoutRequest";
import { Checkout } from "./Checkout";
import { Charge } from "./Charge";
import { User } from "./User";
import { AssetTransfer } from "./AssetTransfer";
import { Partner } from "./Partner";
import { AgreementLink } from "./AgreementLink";
import { KycLink } from "./KycLink";
import { Setting } from "./Setting";
import { CoinRate } from "./CoinRate";

export interface IDbModels {
  AgreementLink: typeof AgreementLink;
  Checkout: typeof Checkout;
  CheckoutRequest: typeof CheckoutRequest;
  AssetTransfer: typeof AssetTransfer;
  KycLink: typeof KycLink;
  Charge: typeof Charge;
  User: typeof User;
  Partner: typeof Partner;
  Setting: typeof Setting;
  CoinRate: typeof CoinRate;
}
