const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUserId, getOpenId } = require('../../utils/utils')
const { CreateAccount }  = require('../../token/ali_token/handle/mutation/mutation')
const { QueryAccount } = require('../../token/ali_token/handle/query/query')
const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.prismaHotel.createUser(
      { ...args, password },
    )
    return {
      token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
      user,
    }
  },

  async login(parent, { email, password, jscode }, ctx, info) {
    const users = await ctx.prismaHotel.users({ where: { email } })
    if (users.length == 0) {
      throw new Error(`No such user found for email: ${email}`)
    }
    const user = users[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
    //we will update wechat openid here
    try {
      wechat = await getOpenId(jscode, 1)
      const thisuser = await ctx.prismaHotel.updateUser(
        {
          data: { wechat: wechat },
          where: { email: email }
        }
      )
    } catch (error) {
      throw (error)
    }
    //we will createwallet if his privatekey and publickey is not null
    var profiles = await ctx.prismaHotel.profiles({ where: { user: { id: user.id } } })
    if (profiles[0].hoteladd == null) {
      var keys = await CreateAccount(profiles[0].id)
      var updatekeys = await ctx.prismaHotel.updateProfile(
        {
          data: {
            privatekey: keys.privatekey,
            publickey: keys.publickey,
          },
          where: { id: profiles[0].id }
        }
      )
      var identity = await QueryAccount(profiles[0].id)
      var updateidentity = await ctx.prismaHotel.updateProfile(
        {
          data: {
            ptadd : identity.identity
          },
          where: { id : personalmsg.id }
        }
      )
      console.log("更新钱包信息成功")
    }


    return {
      token: jwt.sign({ userId: user.id }, 'jwtsecret123'),
      user
    }
  },

  async changepassword(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const users = await ctx.prismaHotel.users({ where: { id } })
    if (!users) {
      throw new Error(`No such user found for email: ${email}`)
    }
    const valid = await bcrypt.compare(args.oldpassword, users[0].password)
    if (!valid) {
      throw new Error('Invalid Password')
    }
    else {
      try {
        const newPassword = await bcrypt.hash(args.newpassword, 10)
        const returning = await ctx.prismaHotel.updateUser(
          {
            data: { password: newPassword },
            where: { id: users[0].id }
          }
        )
      } catch (error) {
        throw error
      }
    }
    return { "error": false }
  },
}



module.exports = { auth }
