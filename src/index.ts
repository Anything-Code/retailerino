import dotenv from 'dotenv';
import express from 'express';
import { schema } from './schema';
import { createContext } from './context';
import expressUseragent from 'express-useragent';
import { ApolloServer } from 'apollo-server-express';

dotenv.config();

const app = express();
app.use(expressUseragent.express());

const apolloServer = new ApolloServer({
    schema,
    context: (ctx) => createContext(ctx),
});

async function startApolloServer(app: express.Application, apolloServer: ApolloServer) {
    await apolloServer.start();

    apolloServer.applyMiddleware({
        app,
        cors: {
            origin: true,
            credentials: true,
        },
    });

    const port = process.env.PORT || 4000;

    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}/graphql`);
    });
}

startApolloServer(app, apolloServer);
