import "reflect-metadata";
import { NextApiRequest, NextApiResponse } from "next";
import { ApolloServer } from "apollo-server-micro";
import { AuthChecker, buildSchema } from "type-graphql";
import Cors from "cors";
import { resolvers } from "@src/server/resolvers";
import { Context } from "vm";

const cors = Cors({
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  origin: [
    "https://studio.apollographql.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
});

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

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function initGraphqlServer() {
  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    context: ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => ({
      req,
      res,
    }),
  });

  return server;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);
  // await connectDB();
  const server = await initGraphqlServer();
  await server.start();
  await server.createHandler({ path: "/api/graphql" })(req, res);
}
