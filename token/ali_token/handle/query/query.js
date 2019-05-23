const env = require("../env/env")
const fs = require('fs')
const abi = JSON.parse(fs.readFileSync('../../contracts/MyToken_sol_MyToken.abi', String))
const contractName = 'MyTokenv2.0.3'


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
function QueryTransaction(txHash) {
    return new Promise((resolve, reject) => {
        env.chain.ctr.QueryTransaction({
            hash: txHash
        }, (err, data) => {
            if (err != null || data.return_code != 0) {
                reject(Error('query transaction failed', err))
            } else {
                var originData = data.tx.data
                resolve({ originData })
            }
        })
    })
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

module.exports = {
    QueryAccount,
    QueryTotalSuppy,
    QueryBalanceOf,
    QueryTransaction,
    QueryTransactionReceipt
}