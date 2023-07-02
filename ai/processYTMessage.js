const { chat } = require('googleapis/build/src/apis/chat')
const YouTubeModel = require('../models/YouTube/Youtube')
const consoleLoging = require('../helpers/consoleLoging')


const startMessagePolling = async (accessToken, chatId) => {
    try {
        console.log('⛔️ Starting Messgae Polling!') //!REMOVE
        while(true){
            const messageData = await YouTubeModel.getLiveChatMessages(accessToken,chatId)

            console.log('⛔️ Message Data: ', messageData)

            messageData.items.forEacht(item => {
                console.log('Message Data Snippet: ', item.snippet) //! REMOVE
                console.log('Message Data Author: ', item.authorDetails) //!REMOVE
            })

            // if(messageData){
            //     processYTMessage(messageData)
            //     return
            // }   

        await new Promise(resolve => setTimeout(resolve, messageData.pollingIntervalMillis));
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