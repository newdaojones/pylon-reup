import "reflect-metadata";
import { ApolloServer } from "apollo-server-micro";
import { AuthChecker, buildTypeDefsAndResolvers } from "type-graphql";
import { graphqlResolvers } from "@src/server/resolvers";
import { handler } from "@src/server/middleware/handler";
import { allowMethods } from "@src/server/middleware/method";
import { authMiddlewareForGraphql } from "@src/server/middleware/auth-graphql";
import { CustomNextApiRequest } from "@src/server/types/request.type";
import { PageConfig } from "next";
import { Context } from "vm";
import { makeExecutableSchema } from "graphql-tools";

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

export const schema = async () => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: graphqlResolvers,
    authChecker,
    emitSchemaFile: "./src/graphql/schema.graphql",
    validate: false,
  });
  return makeExecutableSchema({ typeDefs, resolvers: resolvers });
};

async function initGraphqlServer() {
  const typeSchema = await schema();

  const server = new ApolloServer({
    schema: typeSchema,
    csrfPrevention: false,
    context,
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
