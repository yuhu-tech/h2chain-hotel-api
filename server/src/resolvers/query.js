const { getUserId } = require('../utils')

const query = {
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id)
    const users = await ctx.prisma.users({ where: { id } })
    return users[0]
  }
}

module.exports = { query }
