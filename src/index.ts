import express from 'express'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4'

async function init() {
    const app = express();
    const PORT = Number(process.env.PORT) || 8000;

    app.use(express.json());
    
    // Create GraphQL Server
    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
                say(name: String): String
            }
        `,
        resolvers: {
            Query: {
                hello: () => `Hey there, I am a graphql server`,
                say: (_, { name }: { name: string }) => `Hey ${name}, How are you?`
            }
        }
    });
    
    // Start gqlServer
    await gqlServer.start();
    
    app.get("/", (req, res) => {
        res.json({ message: "Server is Running..." });
    });

    app.use("/graphql", expressMiddleware(gqlServer));
    
    app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`))
}

init();