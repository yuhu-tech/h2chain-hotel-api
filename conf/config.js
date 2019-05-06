
// 设置小程序appid 测试版+正式版
const Appids = {
    testHotel:'wx4a6c47241c7d553e',
    testAdviser:'wxa6d05046539eeb32',
    testHr:'wx4a5990881a856d65',
    testPt:'wx0f2ab26c0f65377d',
    hotel:'wxccd7d7a52024d25e',
    adviser:'wx688abb67f2ee5f67',
    hr:'wx39ee17b2ec06d6eb',
    pt:'wx1326925ef64d9c78',
}

// 设置小程序secret 测试版+正式版
const Secrets = {
    testHotel:'99e8dcb157f65da9927d9502e10cdfa9',
    testAdviser:'ed5169592d4578f0efe62ac2b5c4d660',
    testHr:'9c1fe36eefe2aa2396de48dd9fd58eec',
    testPt:'a5c1eff8b135ade83871f0b230b06ba9',
    hotel:'9042fca3d6d2d037b19652f8e1aa7158',
    adviser:'ddbb5549379fd6c9cbd3d2c583bc83a8',
    hr:'8258f2b0d568f40885ff36518aeb20d4',
    pt:'61f7e33d75b48c0593764a7ac73bea1a',
}

// 设置redis
const RDS = {
    port: 6379,
    host: '119.3.106.151',
    pwd: 'h2chain',
    opts: {
        auth_pass: 'h2chain'
    }
}

module.exports = {
    Appids,
    Secrets,
    RDS
}
