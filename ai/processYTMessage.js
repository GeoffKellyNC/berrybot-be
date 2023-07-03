const { chat } = require('googleapis/build/src/apis/chat')
const YouTubeModel = require('../models/YouTube/Youtube')
const consoleLoging = require('../helpers/consoleLoging')
const Queue = require('../models/Twitch/Queue')

const queue = new Queue()

let POLLING = true


const startMessagePolling = async (accessToken, chatId, type = true) => {

    if(!type) {
        console.log('⛔️ STOPPING POLLING!') //!REMOVE
        POLLING = false
        return false
    }

    try {
        console.log('⛔️ Starting Messgae Polling!') //!REMOVE
        processYTMessage(type)
        while(POLLING){
            console.log('🚧 Getting Messages') //!REMOVE
            const messageData = await YouTubeModel.getLiveChatMessages(accessToken,chatId)
            messageData.items.forEach((item) => {
                const exists = queue.exists(item.id)
                const isProcessed = queue.isProcessed(item.id)

                if (!exists && !isProcessed){
                    const newMessage = {
                        messageId: item.id,
                        user: item.authorDetails.displayName,
                        message: item.snippet.textMessageDetails.messageText,
                        isOwner: item.authorDetails.isChatOwner,
                        isMod: item.authorDetails.isChatModerator, // Corrected here
                        timestamp: item.snippet.publishedAt,
                        sender_img: item.authorDetails.profileImageUrl,
                        chatSponsor: item.authorDetails.isChatSponsor
                    }
                    queue.set_into_queue(newMessage)
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


const processYTMessage = async (type) => {
    try {

        if (!type) {
            console.log('⛔️ STOPPING PROCESSING!') //!REMOVE
            return false
        }

        if(queue.size() > 0){
            const message = queue.dequeue()
            console.log('⛔️ Processing Message: ', message) //!REMOVE

            queue.setProcessed(message.messageId)
        }
        console.log('No more messages to process!') //!REMOVE
        await new Promise(resolve => setTimeout(resolve, 1000));
        processYTMessage()

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