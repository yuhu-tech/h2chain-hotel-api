const { getUserId } = require('../../utils/utils')
const messages = require('../../grpc/mutation/mutation_pb');
const services = require('../../grpc/mutation/mutation_grpc_pb');
const grpc = require('grpc');
const config = require('../../conf/config')
const sd = require('silly-datetime')
const sendtoa = require('../../msg/msghandle/sendmsg/advisermsg')
const sendtop = require('../../msg/msghandle/sendmsg/ptmsg')
const formid = require('../../msg/msghandle/formid/redis')
const client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());
const handles = require('../handle/hotel')

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
    client.createOrder(request, async function (err, response) {
      // set formid which is created when hotel create order
      var userId = id
      var orderId = response.array[0]
      var formId = args.formid
      var setRes = await formid.setFormId(userId, orderId, formId)
      console.log('set formid after creating :', setRes)
    });
  },
  //only createorder will use callback to retrive orderid others will only use search to query orderid and other
  //messages

  async modifyorder(parent, args, ctx, info) {
    const id = getUserId(ctx)
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
    client.modifyPTOfOrder(request, async function (err, response) { console.log(response.array) })

    //to retrieve the whole meaage
    todo = await handles.HotelGetOrderList(ctx, id, args.orderid, 1)
    doing = await handles.HotelGetOrderList(ctx, id, args.orderid, 2)
    Array.prototype.push.apply(todo, doing)
    // set formid which is created when hotel modify order
    var userId = todo[0].originorder.hotelid
    var orderId = args.modifiedorder.orderid
    var formId = args.formid
    var setRes = await formid.setFormId(userId, orderId, formId)
    console.log('set formid after modifying :', setRes)

    // we will fetch adviserid and orderid and openid
    // send msg to adviser after modifying
    var advisers = await ctx.prismaHr.users({ where: { id: todo[0].originorder.adviserid } })
    var timekeyword = ''
    var countkeyword = ''
    var malekeyword = ''
    var femalekeyword = ''
    var general = '酒店端修改用工信息：'
    if (todo[0].modifiedorder[0].changeddatetime != todo[0].originorder.datetime) {
      timekeyword = '用工时间由' + todo[0].originorder.datetime + '更改为' + todo[0].modifiedorder[0].changeddatetime
    }
    if (todo[0].modifiedorder[0].changedcount != todo[0].originorder.count) {
      countkeyword = '用工人数由' + todo[0].originorder.count + '更改为' + todo[0].modifiedorder[0].changedcount
    }

    //compose AdviserMsgData
    var AdviserMsgData = {
      userId: todo[0].originorder.adviserid, //向谁发送？
      orderId: args.modifiedorder.orderid,//这个orderid
      openId: advisers[0].wechat, //向谁发送的openid
      num: 4,
      content: {
        keyword1: general + timekeyword + countkeyword,
        keyword2: sd.format(new Date(), 'YYYY/MM/DD HH:mm'),
        keyword3: '',
      }
    }
    var sendARes = await sendtoa.sendTemplateMsgToAdviser(AdviserMsgData)
    console.log('send msg to adviser after modifying', sendARes)

    // send msg to registried pts after modifying
    // there should be a pt list , have to use for() to handle 
    if (todo[0].pt.length) {
      for (i = 0; i < todo.pt.length; i++) {
        //to retrieve openid
        var users = await ctx.prismaClient.users({ where: { user: { id: todo.pt[i].ptid } } })
        var openId = users[0].wechat
        var PtMsgData = {
          userId: todo[0].pt[i].ptid,
          orderId: args.modifiedorder.orderid,
          openId: openId,
          num: 1,
          content: {
            keyword1: '尊敬的客户，酒店已经更改用工信息',
            keyword2: sd.format(new Date(), 'YYYY/MM/DD HH:mm'),
            keyword3: '',
          }
        }
        var sendPRes = await sendtop.sendTemplateMsgToPt(PtMsgData)
        console.log('send msg to pt after modifying', sendPRes)
      }
    }
  },

  async closeorder(parent, args, ctx, info) {
    const id = getUserId(ctx)
    var client = new services.MutationClient(config.localip, grpc.credentials.createInsecure());
    var request = new messages.CloseRequest();
    request.setOrderid(args.orderid)
    todo = await handles.HotelGetOrderList(ctx, id, args.orderid, 3)
    client.closeOrder(request, async function (err, response) {
      // send msg to adviser after closing
      userId = todo[0].originorder.adviserid
      var hotels = await ctx.prismaHotel.users({ where: { id: id } })
      var profiles = await ctx.prismaHotel.profiles({ where: { user: { id: id } } })
      var name = hotels[0].name
      var hotelname = profiles[0].name
      var occupation = todo[0].originorder.occupation
      //TODO we will change unixint to time here
      if (todo[0].modifiedorder.length) {
        datetime = todo[0].modifiedorder[0].changeddatetime
      } else {
        datetime = todo[0].originorder.datetime
      }
      var advisers = await ctx.prismaHr.users({ where: { id: todo[0].userId } })
      var AdviserMsgData = {
        userId: userId,
        orderId: todo[0].originorder.orderid,
        openId: advisers[0].wechat,
        num: 6,
        content: {
          keyword1: hotelname + datetime + occupation,
          keyword2: name,
          keyword3: sd.format(new Date(), 'YYYY/MM/DD HH:mm'),
        }
      }
      var sendARes = await sendtoa.sendTemplateMsgToAdviser(AdviserMsgData)
      console.log('send msg to adviser after modifying', sendARes)
      // send msg to registried pts after closing
      // there should be a pt list , have to use for() to handle
      if (todo[0].pt.length) {
        for (i = 0; i < todo[0].pt.length; i++) {
          //to retrieve openid
          var users = await ctx.prismaClient.users({ where: { user: { id: todo[0].pt[i].ptid } } })
          var openId = users[0].wechat
          var PtMsgData = {
            userID: todo[0].pt[i].ptid,
            orderId: args.modifiedorder.orderid,
            openId: openId,
            num: 3,
            content: {
              keyword1: hotelname + datetime + occupation + "工作已被关闭",
              keyword2: sd.format(new Date(), 'YYYY/MM/DD HH:mm'),
              keyword3: '',
            }
          }
          var sendPRes = await sendtop.sendTemplateMsgToPt(PtMsgData)
          console.log('send msg to pt after modifying', sendPRes)
        }
      }
    })
  }
}

module.exports = { order }
