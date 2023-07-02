const { chat } = require('googleapis/build/src/apis/chat')
const YouTubeModel = require('../models/YouTube/Youtube')
const consoleLoging = require('../helpers/consoleLoging')


const startMessagePolling = async (accessToken, chatId) => {
    try {
        console.log('⛔️ Starting Messgae Polling!') //!REMOVE
        const messageArray = []
        while(true){
            const messageData = await YouTubeModel.getLiveChatMessages(accessToken,chatId)
            messageData.items.forEach(item => {
                const exists = messageArray.some(chat => item.snippet.id === chat.messageId)

                if (exists){
                    return
                }
                messageArray.push({
                    messageId: item.snippet.id,
                    user: item.authorDetails.displayName,
                    message: item.snippet.textMessageDetails.messageText,
                    isOwner: item.authorDetails.isChatOwner,
                    isMod: item.authorDetails.isChatOwner,
                    timestamp: item.snippet.publishedAt,
                    sender_img: item.authorDetails.profileImageUrl,
                    chatSponsor: item.authorDetails.isChatSponsor
                })
            }) 

            if(messageData){
                processYTMessage(messageArray)
                return
            }   

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
        console.log('⛔️ Messages to Process: ', message)

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