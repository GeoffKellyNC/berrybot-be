require('dotenv').config()
const twitchModel = require('../models/Twitch')
const { RefreshingAuthProvider } = require('@twurple/auth')
const { ChatClient } = require('@twurple/chat');
const consoleLoging = require('../helpers/consoleLoging')



let berryClient;


//* HELPER FUNCTIONS *//

const refreshConfig = async (data) => {
    const oldData = await twitchModel.getBotConfig()
    const newData = {
        ...oldData,
        ...data
    }
    twitchModel.updateBotConfig(newData)
    return
}

const createChatClient = async (authProvider) => {
    const chatClient = new ChatClient({
        authProvider,
        channels: [],
        config: {
            isAlwaysMod: true,
            receiveMembershipEvents: true,
        }
    })
    chatClient.onMessage( async (channel, user, message) => {
        processMessage(channel, user, message, chatClient )
    })
    berryClient = chatClient
    return chatClient
}

const returnBerryClient = () => {
    return berryClient ? berryClient : 'No client'
}


//* MAIN BERRY FUNCITON
const initBerry = async () => {
    const config = await twitchModel.getBotConfig();
    const twitch_client_id = config.twitch_client_id;
    const twitch_client_secret = config.twitch_client_secret;

    const authProvider = new RefreshingAuthProvider(
        {
            twitch_client_id,
            twitch_client_secret,
            onRefresh: async (newTokenData) => {
                await refreshConfig(newTokenData)
            }
        },config )
    
    const botClient = await createChatClient(authProvider)

    // Connect Bot to Twitch
    botClient.connect()
    consoleLoging({
        id: null,
        user: 'BerryBot',
        script: 'twitch_config/berry.js (initBerry)',
        info: 'Berry SUCCESSFULLY connected to twitch!'
    })

}

module.exports = {
    initBerry,
    returnBerryClient
}