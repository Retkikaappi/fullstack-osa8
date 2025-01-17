const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')

const express = require('express')
const cors = require('cors')
const http = require('http')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config()

console.log('connecting to', process.env.MONGODB_URI)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to DB')
  })
  .catch((e) => {
    console.log('error connecting to DB', e.message)
  })

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })
  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req ? req.headers.authorization : null

        if (token && token.startsWith('Bearer ')) {
          const decoToken = jwt.verify(token.substring(7), process.env.SECRET)
          const activeUser = await User.findById(decoToken.id)

          return { activeUser }
        }
      },
    })
  )
  httpServer.listen(4000, () => {
    console.log('server running on http://localhost:4000')
  })
}
start()
