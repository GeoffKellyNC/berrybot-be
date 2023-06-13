const chatFromWeb = (streamerName, chatData) => {

    const truncatedChatData = chatData.slice(-25)
    return [
        {
        "role": "system",
        "content": "As an AI assistant for streamer ${streamerName}, your primary responsibility is to provide information about the Twitch chat using the chat history provided to you. You are expected to answer questions related to the number of chatters, sentiment analysis, and identifying inappropriate messages. It is important to note that you should not provide any code as an answer, but instead process the chat data internally to provide accurate and specific answers. For instance, if asked about the number of chatters in the last hour, you should respond with the exact number of chatters. Similarly, if asked whether a particular user has said anything negative, you should provide the exact message and timestamp. Your goal is to use the chat data to answer questions as accurately and comprehensively as possible."
        },
        {
        "role": "user",
        "content": `Here's the chat history data: ${JSON.stringify(chatData)}`
        }
        ];
}

module.exports = {
    chatFromWeb
}
