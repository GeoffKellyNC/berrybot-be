const { chat } = require('googleapis/build/src/apis/chat')
const YouTubeModel = require('../models/YouTube/Youtube')


const startMessagePolling = async (accessToken, chatId) => {
    try {
        console.log('⛔️ Starting Messgae Polling!') //!REMOVE
        while(true){
            const messageData = await YouTubeModel.getLiveChatMessages(accessToken,chatId)

            // console.log('Message Data: ', messageData) //! REMOVE

            // if(messageData){
            //     processYTMessage(messageData)
            //     return
            // }   

        await new Promise(resolve => setTimeout(resolve, 3000));
    }
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "ai/processYTMessage.js",
            info: error
        })

        return false
    }
}

const processYTMessage = async (message) => {
    try {
        

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "ai/processYTMessage.js",
            info: error
        })
    }
};


module.exports = {
    startMessagePolling
}