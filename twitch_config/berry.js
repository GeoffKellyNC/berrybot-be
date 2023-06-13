require('dotenv').config()
const botModel = require('../models/Twitch/Bot')
const { RefreshingAuthProvider } = require('@twurple/auth')
const { ChatClient } = require('@twurple/chat');
const consoleLoging = require('../helpers/consoleLoging')
const processesMessage = require('../util/processTwitchMessage')

let berryClient;

//* HELPER FUNCTIONS *//

const refreshConfig = async (data) => {
    const oldData = await botModel.getBotConfig()
    const newData = {
        ...oldData,
        ...data
    }
    botModel.updateBotConfig(newData)
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
        processQueue(chatClient, channel, user, { user, message })
    })
    berryClient = chatClient
    return chatClient
}

const returnBerryClient = () => {
    return berryClient ? berryClient : 'No client'
}


//* MAIN BERRY FUNCITON
const initBerry = async () => {
    const config = await botModel.getBotConfig();
    const twitch_client_id = config.twitch_client_id;
    const twitch_client_secret = config.twitch_client_secret;

    const authProvider = new RefreshingAuthProvider(
        {
            clientId: twitch_client_id,
            clientSecret: twitch_client_secret,
            onRefresh: async (newTokenData) => {
                await refreshConfig(newTokenData)
            }
        },
            {
                "accessToken": config.twitch_access_token,
                "refreshToken": config.twitch_refresh_token,
                "expiresIn": 0,
                "obtainmentTimestamp": 0
            })
    
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