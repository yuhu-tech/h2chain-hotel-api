const { getUserId } = require('../utils')
const {need,orderbyorderid, orderbydate,order2,order3, user}= require('./mock')

const query = {
  //my information and my profile
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id);
    const users = await ctx.prismaHotel.users({where:{id}})
    console.log(users[0])
    const profiles  =  await ctx.prismaHotel.profiles({where:{user:{id : id}}})
    var meResult = {
      id:users[0].id,
      name:users[0].name,
      email:users[0].email,
      profile:profiles[0]
    }
    return meRsult
   },
  
  //needs for hotels to choose
  async need (parent,args,ctx,info) {
    const occupations = await ctx.prismaHotel.occupations()
    const advisers = await ctx.prismaHr.users()
    var needResult = {
      occupations:occupations,
      advisers:advisers
    }
  },

  async search (parent, args, ctx, info){
    const id = getUserId(ctx)
    console.log(id)
    if (args.orderid != "" && args.orderid != undefined ){
     const morder = [orderbyorderid]
     console.log(morder)
     console.log(args.orderid)
      return morder
    }
        else {
        const order = [order2,order3]
          console.log(order)
          return order
        }
  }
}

module.exports = { query }
