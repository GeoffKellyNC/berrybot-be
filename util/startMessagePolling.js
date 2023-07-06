const YouTubeModel = require('../models/YouTube/Youtube');
const consoleLoging = require('../helpers/consoleLoging');
const Queue = require('../models/Twitch/Queue');
const processYTMessage = require('../ai/processYTMessage');

const startMessagePolling = async (accessToken, chatId, type = true) => {
    let POLLING = type;
    const queue = new Queue();
    let intervalId;

    if(!type){
        console.log('⛔️ STOPPING POLLING!');
        POLLING = false;
        clearInterval(intervalId);
        return false;
    }

    intervalId = setInterval(async () => {
        await processYTMessage(POLLING, queue);
    }, 1000);

    while(POLLING){
        const messages = await YouTubeModel.getLiveChatMessages(accessToken, chatId);

        messages.items.forEach((item) => {
            const itemsExistsInQueue = queue.exists(item.id);
            const itemAlreadyProcessed = queue.isProcessed(item.id);

            if(!itemsExistsInQueue && !itemAlreadyProcessed){
                const newMessage = {
                    messageId: item.id,
                    user: item.authorDetails.displayName,
                    message: item.snippet.textMessageDetails.messageText,
                    isOwner: item.authorDetails.isChatOwner,
                    isMod: item.authorDetails.isChatModerator, 
                    timestamp: item.snippet.publishedAt,
                    sender_img: item.authorDetails.profileImageUrl,
                    chatSponsor: item.authorDetails.isChatSponsor
                };

                queue.set_into_queue(newMessage);
            }
        });

        await new Promise(resolve => setTimeout(resolve, messages.pollingIntervalMillis));
    }
};


module.exports = startMessagePolling;
