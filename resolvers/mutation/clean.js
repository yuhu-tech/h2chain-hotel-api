var messages = require('../../grpc/mutation/mutation_pb');
var services = require('../../grpc/mutation/mutation_grpc_pb');
var config = require('../../conf/config')
var grpc = require('grpc');

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
    console.log(JSON.stringify(res))
    for (i = 0; i < res.orderOrigins.length; i++) {
      console.log(res.orderOrigins.length)
      for (j = 0; j < res.orderOrigins[i].orderCandidates.length; j++) {
        console.log(res.orderOrigins[i].orderCandidates.length)
        var hotelprofiles = await ctx.prismaHotel.profiles({ where: { user: { id: res.orderOrigins[i].hotelId } } })
        console.log(hotelprofiles)
        var hotelcer = hotelprofiles[0].hotelcer
        var hoteladd = hotelprofiles[0].hoteladd
        var hotelname = hotelprofiles[0].name
        var adviserprofiles = await ctx.prismaHr.profiles({ where: { user: { id: res.orderOrigins[i].adviserId } } })
        var advisercer = adviserprofiles[0].advisercer
        var adviseradd = adviserprofiles[0].adviseradd
        var advisername = adviserprofiles[0].companyname
        var ptprofiles = await ctx.prismaClient.personalmsgs({ where: { user: { id: res.orderOrigins[i].orderCandidates[j].ptId} } })
        var ptcer = ptprofiles[0].ptadd // pt id card number
        var ptadd = ptprofiles[0].idnumber// pt identity
        var ptname = ptprofiles[0].name
      }
    }
  }
  )
}
}

module.exports = { clean }
