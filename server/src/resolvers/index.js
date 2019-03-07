const { query } = require('./query')
const { auth } = require('./mutation/auth')

module.exports = {
  Query: query,
  Mutation: {
    ...auth
  }
}
