const { query } = require('./query')
const { auth } = require('./mutation/auth')
const { order } = require('./mutation/order')

module.exports = {
  Query: query,
  Mutation: {
    ...auth,
    ...order
  }
}
