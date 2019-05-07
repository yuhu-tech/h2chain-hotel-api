const { getUserId } = require('../../utils/utils')
const handles = require('../handle/hotel')
const query = {
  //my information and my profile
  async me(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const users = await ctx.prismaHotel.users({ where: { id } })
    const profiles = await ctx.prismaHotel.profiles({ where: { user: { id: id } } })
    var meResult = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      profile: profiles[0]
    }
    return meResult
  },

  //needs for hotels to choose
  async need(parent, args, ctx, info) {
    const occupations = await ctx.prismaHotel.occupations()
    const advisers = await ctx.prismaHr.users()
    var needResult = {
      occupations: occupations[0].occupations,
      advisers: advisers
    }
    return needResult
  },

  async search(parent, args, ctx, info) {
    const id = getUserId(ctx)
    if (args.state == 12) {
       todo =  await handles.HotelGetOrderList(ctx,id,args.orderid,1,args.datetime,args.ptname);
       doing = await handles.HotelGetOrderList(ctx,id,args.orderid,2,args.datetime,args.ptname);
       Array.prototype.push.apply(todo,doing)
       return todo
       } else {
         return handles.HotelGetOrderList(ctx, id, args.orderid, args.state, args.datetime,args.ptname)
       }
  },
  
  async searchhistory(parent,args,ctx,info){
    return handles.HotelSearchHistory(ctx,args.ptid)
  },

  async searchptoforder(parent, args, ctx, info) {
    const id = getUsedId(ctx)
    var result = handles.HotelGetOrderList(args.orderid)
    return result
  }
}
module.exports = { query }
