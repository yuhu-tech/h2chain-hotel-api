const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.prisma.createUser(
      { ...args, password },
    )

    return {
      token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
      user,
    }
  },

  async login(parent, { email, password }, ctx, info) {
    const users = await ctx.prisma.users({ where: { email } })
    if (!users) {
      throw new Error(`No such user found for email: ${email}`)
    }
    const user = users[0]

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
      user
    }
  },
}

module.exports = { auth }
