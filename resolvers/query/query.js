const { getUserId } = require('../../utils/utils')
const handles = require('../handle/hotel')
const { QueryTransaction } = require('../../token/ali_token/handle/query/query')
const utils = require('../../token/ali_token/utils/utils')
const mutation = require('../../token/ali_token/handle/mutation/mutation')
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

  async mywallet(parent,args,ctx,info){
    var id = getUserId(ctx)
    const profiles = await ctx.prismaHotel.profiles({where:{user:{id:id}}})
    return {
      hoteladdr: profiles[0].hoteladd,
      balance: 0
    }
  },
  
  //needs for hotels to choose
  async need(parent, args, ctx, info) {
    var advisers = []
    const id = getUserId(ctx)
    const occupations = await ctx.prismaHotel.occupations()
    const cooperations = await ctx.prismaHr.cooperations({where:{hotelid:id}})
    for (i=0 ; i< cooperations.length; i++){
     const ad = await ctx.prismaHr.user({id:cooperations[i].adviserid})	
     var adviser = {}
     adviser['name']  = ad.name
     adviser['id'] = ad.id
     var profiles = await ctx.prismaHr.profiles({where:{user:{id:ad.id}}})
     adviser['phone'] = ad.phone
     if (profiles[0] != null && profiles[0] != undefined){
       adviser['companyname'] = profiles[0].companyname
     }
     advisers.push(adviser)
    }
    var needResult = {
      occupations: occupations[0].occupations,
      advisers: advisers
    }
    return needResult
  },

  async search(parent, args, ctx, info) {
    const id = getUserId(ctx)
    if (args.state == 12) {
      todo = await handles.HotelGetOrderList(ctx, id, args.orderid, 1, args.datetime, args.ptname);
      doing = await handles.HotelGetOrderList(ctx, id, args.orderid, 2, args.datetime, args.ptname);
      Array.prototype.push.apply(todo, doing)
      return todo
    } else {
      return handles.HotelGetOrderList(ctx, id, args.orderid, args.state, args.datetime, args.ptname)
    }
  },

  async searchhistory(parent, args, ctx, info) {
    return handles.HotelSearchHistory(ctx, args.ptid)
  },

  async searchptoforder(parent, args, ctx, info) {
    const id = getUsedId(ctx)
    var result = handles.HotelGetOrderList(args.orderid)
    return result
  },


  async searchhash(parent,args,ctx,info) {
    var token = await mutation.applyAccessToken()
    var result  = await QueryTransaction(args.txhash,token)
    var buffered = new Buffer.from(JSON.parse(result.data).transactionDO.data, 'base64')
    var originData = buffered.toString();
    var res = await utils.Hex2Str(originData)
    var res = JSON.parse(res.str)
    res['chainname'] = '蚂蚁区块链h2chain项目'
    var contracts = await ctx.prismaHotel.contracts({where:{hash:args.txhash}})
    res['blocknumber'] = (JSON.parse(result.data)).blockNumber
    res['contractaddress'] = '0x3a758e6e367a783c7e845a91421b6def99972445bcf127bc258c145704953dc6'
    res['hash'] = args.txhash

    return res
  }
}
module.exports = { query }
