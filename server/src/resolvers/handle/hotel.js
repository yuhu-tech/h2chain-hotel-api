var messages = require('../../../../grpc/examples/node/static_codegen/src/query_pb');
var services = require('../../../../grpc/examples/node/static_codegen/src/query_grpc_pb');
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


async function HotelGetOrderList(ctx,hotelid,orderid,state,datetime) {
    try {
       var request = new messages.QueryRequest();
       if (orderid != null && orderid != undefined){
         request.setOrderid(orderid)
       }
       if (hotelid != null && hotelid != undefined){
         request.setHotelid(hotelid)
       }
       else if (datetime != null && datetime != undefined){
         request.setDate(datetime)
       }
       else if (state != null && state != undefined){
         request.setStatus(state)
       } 
        var response = await queryOrder(request);
        var res = JSON.parse(response.array[0])
        var orderList = []
        for (var i = 0; i < res.orderOrigins.length; i++) {
            var obj = {}

            var modifiedorder = []
            if (res.orderOrigins[i].orderHotelModifies.length != 0) {
                for (var j = 0; j < res.orderOrigins[i].orderHotelModifies.length; j++) {
                    var modifiedorderObj = {}
                    modifiedorderObj['orderid'] = res.orderOrigins[i].id
                    modifiedorderObj['changeddatetime'] = res.orderOrigins[i].orderHotelModifies[j].dateTime
                    modifiedorderObj['changedduration'] = res.orderOrigins[i].orderHotelModifies[j].duration
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
            originorder['duration'] = res.orderOrigins[i].duration
            originorder['mode'] = res.orderOrigins[i].mode
            originorder['count'] = res.orderOrigins[i].count
            originorder['male'] = res.orderOrigins[i].countMale
            originorder['female'] = res.orderOrigins[i].count - res.orderOrigins[i].countMale
            originorder['orderstate'] = res.orderOrigins[i].status - 1

            var adviser = {}
            //we add retrieve adviserId here to implement more messsages such as phone and companyname
            var adviserId = res.orderOrigins[i].adviserId
            var users = await ctx.prismaHr.users({where:{id:adviserId}})
            var profiles = await ctx.prismaHr.profiles({where:{user:{id:users[0].id}}})
            adviser['name'] = users[0].name
            adviser['companyname'] = profiles[0].companyname
            adviser['phone'] = profiles[0].phone

            obj['modifiedorder'] = modifiedorder
            obj['originorder'] = originorder
            obj['adviser'] = adviser
            obj['state'] = res.orderOrigins[i].status

            // 查询当前已报名的男女人数
            // 调用queryPTOfOrder()接口查询，某个订单下已报名PT的总人数
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtid('');
                request.setRegistrationchannel('');
                request.setPtstatus(1);
                var response = await queryPt(request)
                obj['countyet'] = response.array[0].length
                // ptid  response.array[0][0][0]
                obj['maleyet'] = 2
                obj['femaleyet'] = 1
            } catch (error) {
                throw error
            }

            orderList.push(obj)
        }
      console.log(orderList)
      return orderList
      //console.log(res.orderOrigins[0])
    } catch (error) {
        throw error
    }
  }


module.exports = { queryOrder,queryPt,HotelGetOrderList }


