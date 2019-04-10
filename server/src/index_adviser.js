const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('../../../h2chain-adviser-api/server/src/resolvers')
const { prismaHr } = require('../../../h2chain-datamodel/server/hr/src/generated/prisma-client')
const { PrismaClient } = require('../../../h2chain-datamodel/server/client/generated/prisma-client')
const { PrismaHotel } = require('../../../h2chain-datamodel/server/hotel/generated/prisma-client')

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prismaHr,
    prismaHotel,
    prismaClient
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'));
//server_adviser.start(()=> console.log('Server is running on http://localhost:4001'))


