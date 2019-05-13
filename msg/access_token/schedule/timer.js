const refresh = require('../refresher/refresh')

async function timer(){
    await refresh.refreshHotelAT();
    await refresh.refreshAdviserAT();
    await refresh.refreshPtAT();
}
timer()
setInterval(timer,3600*1000)