import { CheckoutResolver } from "./checkout.resolver";
import { CheckoutRequestResolver } from "./checkoutRequest.resolver";
import { UserResolver } from "./user.resolver";

export const resolvers = [
  UserResolver,
  CheckoutResolver,
  CheckoutRequestResolver,
] as const;
