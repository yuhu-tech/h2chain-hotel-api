var messages = require('../../api/query/query_pb');
var services = require('../../api/query/query_grpc_pb');
var grpc = require('grpc');
var client = new services.QueryOrderClient('127.0.0.1:50051', grpc.credentials.createInsecure())


// PT端订单页面

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

async function GetHistoryOrders(){
    try {
        var request = new messages.QueryRequest();
        request.setPtid('001');
        request.setStatus(3)
        var response = await queryOrder(request);
        var res = JSON.parse(response.array[0])
        var historyorders = []
        for (var i = 0; i < res.orderOrigins.length; i++) {
            var obj = {}

            var adviser = {}
            adviser['name'] = res.orderOrigins[i].adviserId         // 这里全部留了 adviserId 通过这个获取adviser信息
            adviser['companyname'] = res.orderOrigins[i].adviserId

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

            var postorder = {}
            if (res.orderOrigins[i].orderAdviserModifies.length != 0) {
                postorder['salary'] = res.orderOrigins[i].orderAdviserModifies[0].hourlySalary
                postorder['workcontent'] = res.orderOrigins[i].orderAdviserModifies[0].workCount // 这里有一个命名错误，是由于datamodel.graphql 里面字段错误造成的，后续会改
                postorder['attention'] = res.orderOrigins[i].orderAdviserModifies[0].attention
            }

            var hotel = {}
            hotel['hotelid'] = res.orderOrigins[i].hotelId // 这里全部留了 hotelId 通过这个获取hotel信息
            hotel['hotelname'] = res.orderOrigins[i].hotelId
            hotel['hotelphone'] = res.orderOrigins[i].hotelId
            hotel['hotelintroduction'] = res.orderOrigins[i].hotelId
            hotel['hoteladdress'] = res.orderOrigins[i].hotelId 


            // 查询当前订单下该PT的状态
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtid('001');
                request.setRegistrationchannel('');
                request.setPtstatus(-1);
                var response = await queryPt(request)
                obj['ptorderstate'] = response.array[0][0][7]
            } catch (error) {
                throw error
            }

            obj['adviser'] = adviser
            obj['originorder'] = originorder
            obj['postorder'] = postorder
            obj['hotel'] = hotel

            historyorders.push(obj)
        }
        return historyorders
    } catch (error) {
        throw error
    }
}

async function PTGetOrderList() {
    try {
        var request = new messages.QueryRequest();
        request.setPtid('001');
        request.setStatus(12)
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
            adviser['name'] = res.orderOrigins[i].adviserId // 这里全部留了 adviserId 通过这个获取adviser信息
            adviser['phone'] = res.orderOrigins[i].adviserId
            adviser['companyname'] = res.orderOrigins[i].adviserId
            adviser['introduction'] = res.orderOrigins[i].adviserId

            var hotel = {}
            hotel['hotelid'] = res.orderOrigins[i].hotelId // 这里全部留了 hotelId 通过这个获取hotel信息
            hotel['hotelname'] = res.orderOrigins[i].hotelId
            hotel['hotelphone'] = res.orderOrigins[i].hotelId
            hotel['hotelintroduction'] = res.orderOrigins[i].hotelId
            hotel['hoteladdress'] = res.orderOrigins[i].hotelId

            var postorder = {}
            if (res.orderOrigins[i].orderAdviserModifies.length != 0){
                postorder['orderid'] = res.orderOrigins[i].id
                postorder['salary'] = res.orderOrigins[i].orderAdviserModifies[0].hourlySalary
                postorder['workcontent'] = res.orderOrigins[i].orderAdviserModifies[0].workCount   // 这里有一个命名错误，是由于datamodel.graphql 里面字段错误造成的，后续会改
                postorder['attention'] = res.orderOrigins[i].orderAdviserModifies[0].attention
            }
            
 
            // 查询该PT的历史订单
            var historyorders = []
            historyorders = GetHistoryOrders()
            


            // 查询当前订单下该PT的状态
            try {
                var request = new messages.QueryPTRequest();
                request.setOrderid(res.orderOrigins[i].id);
                request.setPtid('001');
                request.setRegistrationchannel('');
                request.setPtstatus(-1);
                var response = await queryPt(request)
                obj['isregistered'] = response.array[0][0][7]
            } catch (error) {
                throw error
            }

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

            obj['modifiedorder'] = modifiedorder
            obj['originorder'] = originorder
            obj['adviser'] = adviser
            obj['hotel'] = hotel
            obj['postorder'] = postorder
            obj['historyorders'] = historyorders


            orderList.push(obj)
        }
        //console.log(res.orderOrigins[0])
        console.log(orderList)
        console.log(orderList.length)
    } catch (error) {
        throw error
    }
}

function main() {
    PTGetOrderList()
}
main();