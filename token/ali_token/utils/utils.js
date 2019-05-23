function Str2Hex(str) {
    return new Promise((resolve, rejext) => {
        var b = new Buffer(str)
        var base64 = b.toString('base64')
        var hex = '0x' + Buffer.from(base64, 'base64').toString('hex')
        resolve({ hex })
    })
}

function Hex2Str(hex) {
    return new Promise((resolve, rejext) => {
        var length = hex.length
        var handledHex  = hex.slice(2,length)
        var base64 = Buffer.from(handledHex, 'hex').toString('base64')
        var buf = new Buffer(base64, 'base64')
        var str = buf.toString()
        resolve({ str })
    })
}

module.exports = {
    Str2Hex,
    Hex2Str,
}
