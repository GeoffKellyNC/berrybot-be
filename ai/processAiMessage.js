const runModerationModel = require('../ai/moderationAi')
const TwitchModel = require('../models/Twitch/Twitch')
const TrainingModel = require('../models/Twitch/Training')
const UserModel = require('../models/User')
const AiModel = require('../models/AI')
const Queue = require('../models/Queue')

const queue = new Queue();


async function handlePunishment(userConfig, clientConfig, reason){
    switch(userConfig.action){
        case 'timeout':
            await TwitchModel.timeoutUserApi(
                clientConfig.client_id,
                clientConfig.accessToken,
                clientConfig.twitch_id,
                clientConfig.bannedUserId,
                reason,
                userConfig.duration
            )
            return
        case 'ban':
            await TwitchModel.banUserApi(
                clientConfig.client_id,
                clientConfig.accessToken,
                clientConfig.twitch_id,
                clientConfig.bannedUserId,
                reason
            )
            return
        default:
            return
    }
}

//* QueueObj: { user, message}
async function processQueue(chatClient, channel, user, queueObj){
    const unx_id = UserModel.getUserItem(channel.slice(1), 'unx_id')
    const client_id = process.env.TWITCH_CLIENT_ID
    const uai_config = await AiModel.getAiConfig(unx_id)   
    const twitch_id = UserModel.getUserItem(channel.slice(1), 'twitch_id') 


    const pointValues = {
        sexual: 1,
        hate: 3,
        violence: 2,
        'self-harm': 3,
        'sexual/minors': 5,
        'hate/threatening': 2,
        'violence/graphic': 1
    }

    queue.set_into_queue(queueObj);

    while(queue.size() > 0){
        const message_to_process = queue.dequeue();

        const aiRes = await runModerationModel(message_to_process.message);

        if (!aiRes.flagged && message_to_process.message){
            await UserModel.logChatMessage({
                twitch_name: channel.slice(1),
                chatter_name: message_to_process.user,
                message: message_to_process.message,
                flagged: false,
                reason: false,
                confidence_raw: false,
                confidence_fixed: false,
                ai_scores: aiRes.rawScores
            })
            return
        }

        const accessToken = await UserModel.getUserItems(channel.slice(1), 'access_token')
        const bannedUserData = await TwitchModel.getUserIdByName(message_to_process.user, client_id, accessToken)
        const bannedUserId = bannedUserData.id

        for(const category in aiRes.categories){
            if(aiRes.categories[category] && uai_config.punishments[category].enabled){
                await UserModel.logChatMessage({
                    twitch_name: channel.slice(1),
                    chatter_name: message_to_process.user,
                    message: message_to_process.message,
                    flagged: true,
                    reason: category,
                    confidence_raw: aiRes.rawScores[category],
                    confidence_fixed: aiRes.scores[category],
                    ai_scores: aiRes.rawScores
                })
                if(aiRes.scores[category] >= uai_config.thresholds[category]){
                    if(message_to_process.user === 'xberrybot' || message_to_process.user === channel.slice(1)){
                        return
                    }
                    await UserModel.addModerationPoints(twitch_id, user, pointValues[category])
                    await handlePunishment(uai_config.punishments[category], {client_id, accessToken, twitch_id, bannedUserId }, `Berry ${uai_config.punishments[category].action} for ${category}. Confidence: ${aiRes.scores[category]}`)
                    return
                }
                return
            }
        }

    }
}

module.exports = { processQueue };


