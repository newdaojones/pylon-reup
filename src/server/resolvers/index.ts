import { CheckoutResolver } from "./checkout.resolver";
import { CheckoutRequestResolver } from "./checkoutRequest.resolver";
import { HelloWorldResolver } from "./helloworld.resolver";
import { UserResolver } from "./user.resolver";

export const graphqlResolvers = [
  UserResolver,
  CheckoutResolver,
  CheckoutRequestResolver,
  HelloWorldResolver,
] as const;
