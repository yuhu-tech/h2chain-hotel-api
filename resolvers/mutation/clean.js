var messages = require('../../grpc/mutation/mutation_pb');
var services = require('../../grpc/mutation/mutation_grpc_pb');
var config = require('../../conf/config')
var grpc = require('grpc');
var mutation = require('../../token/ali_token/handle/mutation/mutation')
var utils = require('../../token/ali_token/utils/utils')

// 创建和修改用工备注
//
const clean = {
  async clean(parent, args, ctx, info) {
    console.log("function begin")
    var client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());
    var request = new messages.CleanRequest();
    var timenow = Math.round(Date.now() / 1000) + 86400 * 3
    console.log(timenow)
    request.setDate(timenow)       // 填入当前时间 unix
    client.cleanOrder(request, async function (err, response) {
      var res = JSON.parse(response.array[0])
      for (i = 0; i < res.orderOrigins.length; i++) {
          // hotel msg
          var hotelprofiles = await ctx.prismaHotel.profiles({ where: { user: { id: res.orderOrigins[i].hotelId } } })
          var hotelcer = hotelprofiles[0].hotelcer
          var hoteladdr = hotelprofiles[0].hoteladd
          var hotelname = hotelprofiles[0].name
          var hotelusers  = await ctx.prismaHotel.users({where:{id: res.orderOrigins[i].hotelId}})
          var hotelhrname = hotelusers[0].name
          // adviser msg
          var adviserprofiles = await ctx.prismaHr.profiles({ where: { user: { id: res.orderOrigins[i].adviserId } } })
          var advisercer = adviserprofiles[0].advisercer
          var adviseraddr = adviserprofiles[0].adviseradd
          var advisername = adviserprofiles[0].companyname
          var adviserusers =  await ctx.prismaHr.users({where:{id:res.orderOrigins[i].adviserId}})
          var adviserhrname = adviserusers[0].name
        for (j = 0; j < res.orderOrigins[i].orderCandidates.length; j++) {
          var ptprofiles = await ctx.prismaClient.personalmsgs({ where: { user: { id: res.orderOrigins[i].orderCandidates[j].ptId } } })
          var ptcer = ptprofiles[0].idnumber// pt id card number
          var ptaddr = ptprofiles[0].ptadd// pt identity
          var ptname = ptprofiles[0].name
          var occupation = res.orderOrigins[i].job
          if (res.orderOrigins[i].orderHotelMofies.length != 0){
            datetime = res.orderOrigins[i].orderHotelMofies[0].dateTime
          } else {
            datetime = res.orderOrigins[i].datetime
          }
          var isrefused = orderOrigins[i].orderCandidates[j].ptStatus
          //to construct a certain kind of data to be shown on blockchain 
          var data = {
            hotelcer: hotelcer,
            hoteladdr: hoteladdr,
            hotelname: hotelname,
            advisercer: advisercer,
            adviseraddr: adviseraddr,
            advisername: advisername,
            ptcer: ptcer,
            ptaddr: ptaddr,
            ptname: ptname,
            occupation: occupation,
            datetime : datetime,
            isrefused: isrefused,
          }
          var dataStr = JSON.stringify(data)
          var hashData = await utils.Str2Hex(dataStr)
          var result = await mutation.NativeDepositData(hashData.hex)
          //to save the data to local
          var contract  = await ctx.prismaHotel.createContract({
            hotelid:res.orderOrigins[i].hotelId,
            adviserid:res.orderOrigins[i].adviserId,
            ptid:res.orderOrigins[i].orderCandidates[j].ptId,
            hash:result.txhash,
            blocknumber:result.blockNumber
          })
        }
      }
    }
    )
  }
}

module.exports = { clean }
