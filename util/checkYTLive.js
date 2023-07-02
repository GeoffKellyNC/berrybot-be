const YoutubeModel = require('../models/YouTube/Youtube');
const { startMessagePolling } = require('../ai/processYTMessage')

const checkYTLive = async (accessToken) => {
    console.log('⛔️CHECKING IF USER IS LIVE....')
    let isLive = false;
    let chatId

    while(!isLive) {
        console.log('🚧 NOT LIVE CHECKING AGAIN....') //!REMOVE
        const liveStream = await YoutubeModel.getLiveChatId(accessToken);

        console.log('⛔️ Live Stream Check: ', liveStream) //!REMOVE

        if(liveStream) {
            isLive = true;
            chatId = liveStream.liveChatId
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        
    }

    console.log('⛔️ USER IS LIVE!')
    await startMessagePolling(accessToken, chatId)
    return chatId
}

module.exports = checkYTLive