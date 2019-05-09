const { getUserId } = require('../../utils/utils')
const messages = require('../../grpc/mutation/mutation_pb');
const services = require('../../grpc/mutation/mutation_grpc_pb');
const grpc = require('grpc');
const config = require('../../conf/config')
const client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());

const order = {
  async createorder(parent, args, ctx, info) {
    const id = getUserId(ctx) //retrieve userid to put it into hotelId
    const users = await ctx.prismaHr.users({ where: { name: args.createorder.advisername } })
    var request = new messages.CreateRequest();
    request.setHotelid(id)  //hotelid can be received for ctx utils
    request.setAdviserid(users[0].id)  // adviser name can be received from adviser_name
    request.setJob(args.createorder.occupation)
    request.setDate(args.createorder.datetime)
    request.setDuration(args.createorder.duration)
    request.setCount(args.createorder.count)
    request.setCountmale(args.createorder.male)
    request.setMode(args.createorder.mode)
    client.createOrder(request, function (err, response) {
    });
  },

  async modifyorder(parent, args, ctx, info) {
    var request = new messages.ModifyRequest();
    request.setOrderid(args.modifiedorder.orderid);
    request.setDatechanged(args.modifiedorder.changeddatetime);
    request.setDurationchanged(args.modifiedorder.changedduration);             //为修改的数据，传 -1 或者 原数据值
    request.setCountchanged(args.modifiedorder.changedcount);
    request.setCountmalechanged(args.modifiedorder.changedmale);
    request.setMode(args.modifiedorder.changedmode);
    client.modifyOrder(request, function (err, response) { console.log(response.array) })
    //we need to change the state of pt to order to 4 for the pts to decide if they will go.
    var request = new messages.ModifyPtRequest();
    request.setOrderid(args.modifiedorder.orderid);       // OrderID 必传
    request.setTargetstatus(4);                           // PT 目标状态 筛选条件，不同传 -1  
    request.setSourcestatus(1);                           // PT 原始状态  
    client.modifyPTOfOrder(request, function (err, response) { console.log(response.array) });
  },


  async closeorder(parent, args, ctx, info) {
    var client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());
    var request = new messages.CloseRequest();
    request.setOrderid(args.orderid)
    client.closeOrder(request, function (err, response) {
    })
  }
}


module.exports = { order }
