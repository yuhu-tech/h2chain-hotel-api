const { AuthPayload } = require('./AuthPayload')
const { auth } = require('./mutation/auth')

module.exports = {
  Mutation: {
    ...auth
  },
  AuthPayload
}
