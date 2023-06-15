require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const { chatFromWeb } = require('./prompt');
const UserModel = require('../models/Twitch/User');

const MAX_TOKENS = 800; // GPT-3.5-turbo's maximum token limit
const OPEN_AI_MODEL = 'gpt-3.5-turbo-16'

const getTokens = (messageObj) => {
  const keys = Object.keys(messageObj);
  let tokens = 0;

  keys.forEach((key) => {
    if (typeof messageObj[key] === 'string') {
      tokens += messageObj[key].split(/[\s\p{P}]+/u).length;
    } else if (key === 'ai_scores' && messageObj[key]) {
      const aiScoresKeys = Object.keys(messageObj[key]);
      aiScoresKeys.forEach((aiKey) => {
        tokens += aiKey.split(/[\s\p{P}]+/u).length;
        tokens += String(messageObj[key][aiKey]).split(/[\s\p{P}]+/u).length;
      });
    }
  });

  return tokens;
};

const divideChatData = (chatData) => {
    const chunks = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setHours(0, 0, 0, 0);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
    let currentChunk = [];
    let currentChunkTokens = 0;
  
    for (let i = 0; i < chatData.length; i++) {
      const message = chatData[i];
      const messageDate = new Date(message.timestamp);
  
      if (messageDate < threeMonthsAgo || messageDate > currentDate) {
        // skip messages outside the desired time range
        continue;
      }
  
      const messageTokens = getTokens(message);
  
      if (currentChunkTokens + messageTokens > MAX_TOKENS) {
        // split current chunk further if it exceeds token limit
        while (currentChunk.length > 0) {
          const newChunk = [];
  
          while (currentChunk.length > 0 && getTokens(currentChunk[0]) <= MAX_TOKENS) {
            const message = currentChunk.shift();
            newChunk.push(message);
            currentChunkTokens -= getTokens(message);
          }
  
          chunks.push(newChunk);
        }
  
        currentChunk = [message];
        currentChunkTokens = messageTokens;
      } else {
        currentChunk.push(message);
        currentChunkTokens += messageTokens;
      }
    }
  
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
  
    return chunks;
  };
  

  const runChatFromWebModel = async (streamerName, question) => {
    console.log('Running chatFromWeb model...');
    console.log(`Streamer name: ${streamerName}`);
    console.log(`Question: ${question}`);
  
    console.log('Getting chat data...');
    const chatData = await UserModel.getUserChatLogs(streamerName);
    console.log(`Got chat data with ${chatData.length} messages`);
  
    console.log('Dividing chat data into chunks...');
    const chatChunks = divideChatData(chatData.reverse().slice(0, 40));
    console.log(`Chat data divided into ${chatChunks.length} chunks`);
  
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
  
    const openai = new OpenAIApi(configuration);
  
    let combinedResponse = '';
  
    try {
      for (const [index, chunk] of chatChunks.entries()) {
        console.log(`Processing chunk ${index + 1} with ${chunk.length} messages`);
        console.log(`Chunk ${index + 1} has ${getTokens(chunk)} tokens`);
        const prompt = chatFromWeb(streamerName, chunk);
        prompt.push({ role: 'user', content: question });
  
        console.log(`Sending question for chunk ${index + 1}...`);
        const response = await openai.createChatCompletion({
          model: OPEN_AI_MODEL,
          messages: prompt
        });
  
        const responseTokens = response.data.choices[0].message.content.split(' ').length;
        console.log(`Chunk ${index + 1} response has ${responseTokens} tokens`);
  
        if (combinedResponse.length + responseTokens > MAX_TOKENS) {
          const truncatedResponse = response.data.choices[0].message.content
            .split(/[\s\p{P}]+/u)
            .slice(0, MAX_TOKENS - combinedResponse.length)
            .join(' ');
  
          combinedResponse += truncatedResponse;
          console.log(`Truncated response for chunk ${index + 1}: ${truncatedResponse}`);
          break;
        } else {
          combinedResponse += response.data.choices[0].message.content;
          console.log(`AI responded for chunk ${index + 1}...`);
        }
      }
  
      console.log('Combined AI response:', combinedResponse);

      const finalRes = await summerizeData(combinedResponse, openai, streamerName)
      return finalRes
  
    } catch (error) {
      console.log("Error:", error.response ? error.response.data : error.message);
    }
  }

  async function summerizeData(data, openaiClient, streamerName) {
    console.log('SUMMERIZING DATA!...') //!REMOVE
    const prompt = [{role: "system", content: `The following data is a series of responses you gave about twitch steamer ${streamerName}. I need you to summerize these responses for into one response. Here is the data: ${data} `}]

    const response = await openaiClient.createChatCompletion({
        model: 'gpt-4',
        messages: prompt
    })

    console.log('SUMMERIZED RESPONSE', response.data) //!REMOVE

    return response.data.choices[0].message.content;
        
  }
  
  module.exports = runChatFromWebModel;
  

