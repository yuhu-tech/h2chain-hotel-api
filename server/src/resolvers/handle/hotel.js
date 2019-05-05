var messages = require('../../../../grpc/examples/node/static_codegen/hotelgrpc/query_pb');
var services = require('../../../../grpc/examples/node/static_codegen/hotelgrpc/query_grpc_pb');
var grpc = require('../../../../grpc/examples/node/node_modules/grpc');
var client = new services.QueryOrderClient('127.0.0.1:50051', grpc.credentials.createInsecure())


// 酒店端订单页面
function queryOrder(request) {
  return new Promise((resolve, reject) => {
    client.queryOrder(request, (err, date) => {
      if (err) reject(err);
      resolve(date);
    })
  })
}

function queryPt(request) {
  return new Promise((resolve, reject) => {
    client.queryPTOfOrder(request, (err, date) => {
      if (err) reject(err);
      resolve(date);
    })
  })
}


async function HotelGetOrderList(ctx, hotelid, orderid, state, datetime) {
  try {
    var request = new messages.QueryRequest();
    if (orderid != null && orderid != undefined) {
      request.setOrderid(orderid)
    }
    if (hotelid != null && hotelid != undefined) {
      request.setHotelid(hotelid)
    }
    if (datetime != null && datetime != undefined) {
      request.setDate(datetime)
    }
    if (state != null && state != undefined) {
      request.setStatus(state)
    }
    var response = await queryOrder(request);
    var res = JSON.parse(response.array[0])
    var orderList = []
    for (var i = 0; i < res.orderOrigins.length; i++) {
      var obj = {}

      var modifiedorder = []
      var isModified = false
      if (res.orderOrigins[i].orderHotelModifies.length != 0) {
	isModified = true
        for (var j = 0; j < res.orderOrigins[i].orderHotelModifies.length; j++) {
          var modifiedorderObj = {}
          modifiedorderObj['orderid'] = res.orderOrigins[i].id
          modifiedorderObj['changeddatetime'] = res.orderOrigins[i].orderHotelModifies[j].dateTime
          modifiedorderObj['changedduration'] = res.orderOrigins[i].orderHotelModifies[j].duration / 3600
          modifiedorderObj['changedmode'] = res.orderOrigins[i].orderHotelModifies[j].mode
          modifiedorderObj['changedcount'] = res.orderOrigins[i].orderHotelModifies[j].count
          modifiedorderObj['changedmale'] = res.orderOrigins[i].orderHotelModifies[j].countMale
          modifiedorderObj['changedfemale'] = res.orderOrigins[i].orderHotelModifies[j].count - res.orderOrigins[i].orderHotelModifies[j].countMale
          modifiedorder.push(modifiedorderObj)
        }
      }

      var originorder = {}
      originorder['orderid'] = res.orderOrigins[i].id
      originorder['occupation'] = res.orderOrigins[i].job
      originorder['datetime'] = res.orderOrigins[i].datetime
      originorder['duration'] = res.orderOrigins[i].duration / 3600
      originorder['mode'] = res.orderOrigins[i].mode
      originorder['orderstate'] = res.orderOrigins[i].status - 1

      if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
        if (res.orderOrigins[i].orderAdviserModifies[0].isFloat) {
          //we judge if we will tranfer male and female number by the mode
          if (res.orderOrigins[i].mode == 0) {
            originorder['male'] = 0
            originorder['female'] = 0
            originorder['count'] = Math.ceil(res.orderOrigins[i].count * 1.05)
          } else {
            originorder['male'] = Math.ceil(res.orderOrigins[i].countMale * 1.05)
            originorder['female'] = Math.ceil((res.orderOrigins[i].count - res.orderOrigins[i].countMale) * 1.05)
            originorder['count'] = originorder['male'] + originorder['female']
          }
        } else {
          if (res.orderOrigins[i].mode == 0) {
            originorder['male'] = 0
            originorder['female'] = 0
            originorder['count'] = res.orderOrigins[i].count
          } else {
            originorder['male'] = res.orderOrigins[i].countMale
            originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
            originorder['count'] = originorder['male'] + originorder['female']
          }
        }
      } else {
        if (res.orderOrigins[i].mode == 0) {
          originorder['male'] = 0
          originorder['female'] = 0
          originorder['count'] = res.orderOrigins[i].count
        } else {
          originorder['male'] = res.orderOrigins[i].countMale
          originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
          originorder['count'] = originorder['male'] + originorder['female']
        }

      }

      var adviser = {}
      //we add retrieve adviserId here to implement more messsages such as phone and companyname
      var adviserId = res.orderOrigins[i].adviserId
      var users = await ctx.prismaHr.users({ where: { id: adviserId } })
      var profiles = await ctx.prismaHr.profiles({ where: { user: { id: users[0].id } } })
      adviser['name'] = users[0].name
      adviser['companyname'] = profiles[0].companyname
      adviser['phone'] = profiles[0].phone
      obj['modifiedorder'] = modifiedorder
      obj['originorder'] = originorder
      obj['adviser'] = adviser
      obj['state'] = res.orderOrigins[i].status - 1

      var pts = []
      // 查询当前已报名的男女人数
      // 调用queryPTOfOrder()接口查询，某个订单下已报名PT的总人数
      try {
        var request = new messages.QueryPTRequest();
        request.setOrderid(res.orderOrigins[i].id);
        request.setPtstatus(13);
        var response = await queryPt(request)
        obj['countyet'] = response.array[0].length
        if (obj['maleyet'] == undefined) { obj['maleyet'] = 0 }
        if (obj['femaleyet'] == undefined) { obj['femaleyet'] = 0 }
        for (var k = 0; k < obj['countyet']; k++) {
          var ptid = response.array[0][k][0]
          var personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: ptid } } })
          // to judge if there is a male or female
          if (JSON.parse(personalmsgs[0].gender) == 1) {
            obj['maleyet'] = obj['maleyet'] + 1
          } else if (JSON.parse(personalmsgs[0].gender) == 2) {
            obj['femaleyet'] = obj['femaleyet'] + 1
          }
          var pt = {}
          pt['ptid'] = ptid
          pt['name'] = personalmsgs[0].name
          pt['idnumber'] = personalmsgs[0].idnumber
          pt['gender'] = personalmsgs[0].gender
          pt['wechatname'] = "mocked wechat id"
          pt['phonenumber'] = personalmsgs[0].phonenumber
          pt['worktimes'] = 10
          var personalmsgs = await ctx.prismaClient.personalmsgs({ where: { user: { id: ptid } } })
          var personalmsg = personalmsgs[0]
          pt['height'] = personalmsgs[0].height
          pt['weight'] = personalmsgs[0].weight
          //here we retrieve ptorder state
          pt['ptorderstate'] = response.array[0][k][7]
          pts.push(pt)
        }
        obj['pt'] = pts
      }
      catch (error) {
        throw error
      }
      if (isModified === true){
	orderList.unshift(obj)
      }else {
        orderList.push(obj)
      }
    }
    return orderList
  } catch (error) {
    throw error
  }
}


module.exports = { queryOrder, queryPt, HotelGetOrderList }


