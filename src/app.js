import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";

const app = express();
const port = 4000;

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
await apolloServer.start();

app.use("/graphql", cors(), express.json(), expressMiddleware(apolloServer));
app.listen(port, () => {
  console.log(`Server listening on localhost:${port}`);
});
