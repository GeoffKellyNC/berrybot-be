const YoutubeModel = require('../models/YouTube/Youtube');
const { startMessagePolling } = require('../ai/processYTMessage')


let IS_LIVE = false


const checkYTLive = async (accessToken) => {
    console.log('⛔️CHECKING IF USER IS LIVE....')
    let chatId

    while(!IS_LIVE) {
        console.log('🚧 NOT LIVE CHECKING AGAIN....') //!REMOVE
        const liveStream = await YoutubeModel.getLiveChatId(accessToken);

        console.log('⛔️ Live Stream Check: ', liveStream) //!REMOVE

        if(liveStream) {
            IS_LIVE = true;
            chatId = liveStream.snippet.liveChatId

            setInterval( async () => {
                console.log('🚧 CHECKING IF USER IS STILL LIVE....') //!REMOVE
                const stillLive = await YoutubeModel.getLiveChatId(accessToken)
                console.log('⛔️ STILL LIVE CHECK: ', stillLive) //!REMOVE
                if(!stillLive) {
                    console.log('⛔️ USER IS NO LONGER LIVE!') //!REMOVE
                    IS_LIVE = false
                    startMessagePolling(accessToken, chatId, false) //!REMOVE
                }
            }, 10000)
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        
    }

    console.log('⛔️ USER IS LIVE!')
    await startMessagePolling(accessToken, chatId)
    return chatId
}

module.exports = checkYTLive