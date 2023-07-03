const { chat } = require('googleapis/build/src/apis/chat')
const YouTubeModel = require('../models/YouTube/Youtube')
const consoleLoging = require('../helpers/consoleLoging')
const Queue = require('../models/Twitch/Queue')


const startMessagePolling = async (accessToken, chatId) => {
    try {
        console.log('⛔️ Starting Messgae Polling!') //!REMOVE
        let messageArray = []
        while(true){
            const messageData = await YouTubeModel.getLiveChatMessages(accessToken,chatId)
            messageData.items.forEach((item) => {
                console.log('ITEM SNIPPET: ', item.snippet) //!REMOVE
                const exists = messageArray.some(chat => item.snippet.id === chat.messageId)

                if (!exists){
                    const newMessage = {
                        messageId: item.snippet.id,
                        user: item.authorDetails.displayName,
                        message: item.snippet.textMessageDetails.messageText,
                        isOwner: item.authorDetails.isChatOwner,
                        isMod: item.authorDetails.isChatModerator, // Corrected here
                        timestamp: item.snippet.publishedAt,
                        sender_img: item.authorDetails.profileImageUrl,
                        chatSponsor: item.authorDetails.isChatSponsor
                    }
                    messageArray.push(newMessage)
                    processYTMessage(newMessage)
                }
            }) 

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
        return

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