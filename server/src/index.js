const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('./resolvers')
const { prismaHotel } = require('../../../h2chain-datamodel/server/hotel/src/generated/prisma-client')
const { prismaHr } = require('../../../h2chain-datamodel/server/hr/src/generated/prisma-client')
const { prismaClient } = require('../../../h2chain-datamodel/server/client/src/generated/prisma-client')
const { prisma } = require('../../../h2chain-datamodel/server/hotel/src/generated/prisma-client')

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prismaHotel,
    prismaHr,
    prismaClient
  })
})
//we add all prismas into ctx 
server.start(() => console.log('Server is running on http://localhost:4000'));


