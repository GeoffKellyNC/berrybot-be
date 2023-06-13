// const { addToQueue, processQueue } = require('./messageQ')
const { processQueue } = require('../ai/processAiMessage')
const axios = require('axios')
const runAskBerryModel = require('../ai/askBerryModel')
const UserModel = require('../models/User')
const TrainingModel = require('../models/Training')
const TwitchModel = require('../models/Twitch')
const processCustomCommand = require('../util/processCustomCommands')

 
const processMessage = async (channel, user, message, chatClient) => {

    

    await TrainingModel.logTrainingChat(channel.slice(1), message)

    if(message === "!ping"){
        chatClient.say(channel, `Pong! @${user}`)
        return
    }

    if(message === "!berry"){
        chatClient.say(channel, ` 
        Hey there, @{user}! I'm Berry, a Twitch chatbot powered by AI 🤖🍓
        I'm still in beta, so feel free to give me feedback and suggestions!
        Here are some of my commands:
        !ping - I'll respond with "Pong!"
        !yomama - I'll tell you a joke
        !askberry <question> - I'll answer your question
        @xberrybot <question> - I'll answer your question too!`)
        
        return
    }

    if(message === "!yomama"){
        const jokeRes = await axios.get('https://api.yomomma.info/')
        const joke = jokeRes.data.joke
        chatClient.say(channel, `@${user} ${joke}`)
        return
    }

    if(message.startsWith("!askberry")){
        const question = message.slice(10)
        const answer = await runAskBerryModel(question)
        chatClient.say(channel, `@${user} ${answer}`)
        UserModel.logChatMessage({
            twitch_name: channel.slice(1),
            chatter_name: 'xberrybot',
            message: `@${user}: ${answer}`
        })
        return
    }

    if(message.toLowerCase().startsWith("@xberrybot")){
        const question = message.slice(10)
        await UserModel.logChatMessage({
            twitch_name: channel.slice(1),
            chatter_name: user,
            message: question
        })
        const answer = await runAskBerryModel(question)
        chatClient.say(channel, `@${user} ${answer}`)
        await UserModel.logChatMessage({
            twitch_name: channel.slice(1),
            chatter_name: 'xberrybot',
            message: `@${user}: ${answer}`
        })
        return 
    }

    await TwitchModel.processCustomCommand(channel, message, chatClient)

    
    await processQueue(chatClient, channel, user, {user, message})

    return

}

module.exports = processMessage