const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('../resolvers')
const { prismaHotel } = require('../../h2chain-datamodel/hotel/src/generated/prisma-client')
const { prismaHr } = require('../../h2chain-datamodel/hr/src/generated/prisma-client')
const { prismaClient } = require('../../h2chain-datamodel/client/src/generated/prisma-client')

const server = new GraphQLServer({
  typeDefs: './server/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prismaHotel,
    prismaHr,
    prismaClient
  })
})

const options = { port: 4000 }
server.start(options, ({ port }) => console.log('Server is running on http://localhost:4000'));


