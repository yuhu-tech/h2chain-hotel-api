const refresh = require('../refresher/refresh')

async function timer(){
    await refresh.refreshHotelAT();
    await refresh.refreshAdviserAT();
    await refresh.refreshPtAT();
    await refresh.refreshAgentAt();
}

module.exports = {timer}

