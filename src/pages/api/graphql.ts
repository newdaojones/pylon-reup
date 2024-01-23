import "reflect-metadata";
import "@src/server/models";

import { ApolloServer } from "apollo-server-micro";
import { AuthChecker, buildSchema } from "type-graphql";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForGraphql } from "@src/server/middleware/auth-graphql";
import { CustomNextApiRequest } from "@src/server/types/request.type";
import { PageConfig } from "next";
import { Context } from "vm";
import { UserResolver } from "@src/server/resolvers/user.resolver";
import { CheckoutResolver } from "@src/server/resolvers/checkout.resolver";
import { CheckoutRequestResolver } from "@src/server/resolvers/checkoutRequest.resolver";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles
) => {
  if (roles.length === 0) {
    // if `@Authorized()`, check only is user exist
    return user !== undefined;
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false;
  }

  // no roles matched, restrict access
  return false;
};

const context = ({
  req,
  connection,
}: {
  req: CustomNextApiRequest;
  connection: any;
}) => {
  if (connection) {
    return connection.context;
  }

  return {
    user: req.user,
  };
};

async function initGraphqlServer() {
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      CheckoutResolver,
      CheckoutRequestResolver,
      // HelloWorldResolver,
    ],
    authChecker,
    // container: Container,
  });

  const server = new ApolloServer({
    schema,
    csrfPrevention: false,
    context,
    plugins: [],
  });

  return server;
}

export default handler(
  allowMethods(["POST", "GET"]),
  authMiddlewareForGraphql,
  async (req, res) => {
    const server = await initGraphqlServer();
    await server.start();
    await server.createHandler({ path: "/api/graphql" })(req, res);
  }
);
