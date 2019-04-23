const { getUserId } = require('../utils')
const {need,orderbyorderid, orderbydate,order2,order3, user}= require('./mock')
const handles  = require('../resolvers/handle/hotel')
const query = {
  //my information and my profile
  async me (parent, args, ctx, info) {
    const id = getUserId(ctx)
    console.log(id);
    const users = await ctx.prismaHotel.users({where:{id}})
    console.log(users[0])
    const profiles  =  await ctx.prismaHotel.profiles({where:{user:{id : id}}})
    console.log(profiles)
    var meResult = {
      id:users[0].id,
      name:users[0].name,
      email:users[0].email,
      profile:profiles[0]
    }
    return meResult
   },
  
  //needs for hotels to choose
  async need (parent,args,ctx,info) {
    const occupations = await ctx.prismaHotel.occupations()
    const advisers = await ctx.prismaHr.users()
    console.log(occupations[0].occupations)
    var needResult = {
      occupations:occupations[0].occupations,
      advisers:advisers
    }
    return needResult
  },

  async search (parent, args, ctx, info){
    const id = getUserId(ctx)
    console.log("id is ..."+ id)
    var result =  handles.HotelGetOrderList(ctx,id,args.orderid,args.state,args.datetime)    
    return result

    }
}

module.exports = { query }
