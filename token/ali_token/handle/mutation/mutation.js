//const Chain = require("@alipay/mychain/index.node") //在 node 环境使用 TLS 协议
//const env = require("../env/env")
const fs = require('fs')
const path = require('path')
const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../contracts/MyToken_sol_MyToken.abi'), String))
const contractName = 'MyTokenv2.0.3'
const urlShakeHand = 'https://rest.baas.alipay.com/api/contract/shakeHand';
const urlCall = 'https://rest.baas.alipay.com/api/contract/chainCallForBiz';
const request = require('request');
let data = fs.readFileSync('./access.key')
let privateKey = data.toString();
let dateTime = Date.now();
const crypto = require('crypto');


let bizid = 'a00e36c5';
let account = 'qinxi';
let tenantid = 'OZHZQHJH';
let mykmsKeyId = 'rDofu1uBOZHZQHJH1589174953066';
let method = 'DEPOSIT';
let accessId = 'nxcLnI0QOZHZQHJH';
let gas = '10000000'

// 使用新创建的key创建账户

// 2020 new chain
function applyAccessToken() {
  return new Promise((resolve, reject) => {
    let data = accessId + dateTime;
    let sign = crypto.createSign('RSA-SHA256');
    sign.update(new Buffer.from(data, 'utf-8'));
    let sigRes = sign.sign(privateKey, 'hex');
    const options = {
      url: urlShakeHand,
      method: 'POST',
      body: {
        "accessId": accessId,
        "time": dateTime,
        "secret": sigRes
      },
      json: true
    }
    request(options, function (err, res, body) {
      if (err) {
        console.log(err);
      } else {
        resolve(body);
      }
    });
  })
}

function depositData(orderId, content, token) {
  return new Promise((resolve, reject) => {
    const options = {
      url: urlCall,
      method: 'POST',
      body: {
        orderId: orderId,
        bizid: bizid,
        account: account,
        content: content,
        tenantid: tenantid,
        mykmsKeyId: mykmsKeyId,
        method: method,
        accessId: accessId,
        token: token.data,
        gas: gas
      },
      json: true
    }

    console.log(options);

    request(options, function (err, res, body) {
      if (err) {
        console.log(err);
      } else {
        resolve(body);
      }
    });
  })
}

function CreateAccount(userId) {
  return new Promise((resolve, reject) => {
    const newKey = Chain.utils.generateECKey();
    const privateKey = newKey.privateKey.toString('hex')
    const publicKey = newKey.publicKey.toString('hex')
    env.chain.ctr.CreateAccount({
      from: 'qinxi',
      to: userId,
      data: {
        recover_key: '0x' + newKey.publicKey.toString('hex'),      // 新账户恢复公钥
        auth_key: '0x' + newKey.publicKey.toString('hex'),         // 新目标账户公钥
        auth_weight: 100                                          // 权重值
      }
    }, (err, data) => {
      if (err != null || data.return_code != 0) {
        reject(Error('create account failed', err))
      }
      resolve({
        privateKey,
        publicKey
      })
    })
  })
}

function Issue(to, value) {
  return new Promise((resolve, reject) => {
    let myContract = env.chain.ctr.contract(contractName, abi)
    myContract.transfer(to, value, { from: 'qinxi' }, (err, output, data) => {
      if (err != null) {
        reject(err)
        console.log(data)
      } else {
        var txhash = data.txhash
        resolve({ txhash, output })
      }
    })
  })
}

/*
from 转账发起用户id或者identity
publicKey 用户公钥
privateKey 用户私钥
to 转账目标账户identity
value 转账数量
*/
function Transfer(from, publicKey, privateKey, to, value) {
  return new Promise((resolve, reject) => {

    env.opt.userPublicKey = publicKey
    env.opt.userPrivateKey = privateKey
    env.opt.userRecoverPublicKey = publicKey
    env.opt.userRecoverPrivateKey = privateKey
    env.chain.setUserKey(env.opt)
    env.chain.setUserRecoverKey(env.opt)

    let myContract = env.chain.ctr.contract(contractName, abi)
    myContract.transfer(to, value, { from: from }, (err, output, data) => {
      if (err != null) {
        reject(err)
        console.log(data)
      } else {
        var txhash = data.txhash
        resolve({ txhash, output })
      }
    })
  })
}

function NativeDepositData(hashData) {
  console.log("begin")
  return new Promise((resolve, reject) => {
    env.chain.ctr.NativeDepositData({
      from: 'qinxi',
      to: 'qinxi',
      data: {
        payload: hashData  //存证的数据内容，被序列化为 16 进制
      }
    }, (err, data) => {
      if (err != null || data.return_code != 0) {
        reject(Error('native deposit data failed', err))
      } else {
        var txhash = data.txhash
        var blockNumber = data.block_number
        resolve({ txhash, blockNumber })
      }
    })
  })
}


// testing 
//async function deposit() {
//  let a = await applyAccessToken();
//  let b = await depositData("orderId001","mayijinfu",a)
//  console.log(b);
//}

// deposit();



module.exports = {
  CreateAccount,
  Issue,
  Transfer,
  NativeDepositData,
  depositData,
  applyAccessToken,
}


