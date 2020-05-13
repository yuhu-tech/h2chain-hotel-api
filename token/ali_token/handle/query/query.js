const path = require('path')
const env = require("../env/env")
const fs = require('fs')
const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../contracts/MyToken_sol_MyToken.abi'), String))
const contractName = 'MyTokenv2.0.3'

const urlCall = 'https://rest.baas.alipay.com/api/contract/chainCallForBiz';
let bizid = 'a00e36c5';
let account = 'qinxi';
let tenantid = 'OZHZQHJH';
let mykmsKeyId = 'rDofu1uBOZHZQHJH1589174953066';
let method = 'QUERYTRANSACTION';
let accessId = 'nxcLnI0QOZHZQHJH';
let gas = '10000000'



function QueryAccount(userId) {
    return new Promise((resolve, reject) => {
        env.chain.ctr.QueryAccount({
            from: userId
        }, (err, data) => {
            if (err != null || data.return_code != 0) {
                reject(Error('query account failed'))
            } else {
                var identity = data.data.identity
                resolve({ identity })
            }
        })
    })
}

// 调用合约函数，查询合约token发布总量
function QueryTotalSuppy() {
    return new Promise((resolve, reject) => {
        let myContract = env.chain.ctr.contract(contractName, abi)
        myContract.totalSupply({ from: 'qinxi' }, (err, output, data) => {
            if (err != null) {
                reject(err)
            } else {
                var totalSupply = output.c[0]
                console.log(output)
                console.log(totalSupply)
                resolve({ totalSupply })
            }
        })

    })
}

// 调用合约函数，查询账户余额
function QueryBalanceOf(userId) {
    return new Promise((resolve, reject) => {
        let myContract = env.chain.ctr.contract(contractName, abi)
        myContract.balanceOf(userId, { from: 'qinxi' }, (err, output, data) => {
            if (err != null) {
                reject(err)
            } else {
                var balance = output.c[0]
                resolve({ balance })
            }
        })

    })
}

//存证后，如果需要查询存证数据，可通过 QueryTransaction 传入存证交易的 hash 查询
function QueryTransaction(txHash, token) {
    options = {
        url: urlCall,
        method: 'POST',
        body: {
            bizid: bizid,
            method: method,
            hash: txHash,
            accessId: accessId,
            token: token
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
}

//通过 QueryTransaction 查询到存证交易，证明交易发生，通过 QueryTransactionReceipt 可以验证交易成功（return_code 为0），共识后进入区块。
function QueryTransactionReceipt() {
    return new Promise((resolve, reject) => {
        env.chain.ctr.QueryTransactionReceipt({
            hash: data.txhash
        }, (err, data) => {
            if (err != null || data.return_code != 0) {
                reject(Error('query transaction receipt failed', err))
            } else {
                var result = data.receipt.result
                resolve({ result })
            }
        })
    })
}

//查询合约地址
function QueryContract() {
    return new Promise((resolve, reject) => {
        env.chain.ctr.QueryContract({
            from: contractName
        }, (err, data) => {
            if (err != null || data.return_code != 0) {
                reject(Error('query contract failed', err))
            } else {
                var identity = data.data.identity
                resolve({ identity })
            }
        })
    })
}

module.exports = {
    QueryAccount,
    QueryTotalSuppy,
    QueryBalanceOf,
    QueryTransaction,
    QueryTransactionReceipt,
    QueryContract,
}
