require('dotenv').config();
const { returnBerryClient } = require('../../twitch_config/berry');
const axios = require('axios');
const { mongo } = require('../../db/mongo_config')

const intervalIds = new Map();
const activeCommands = new Map();
const db = mongo.db(process.env.MONGO_DB_NAME)

async function connectToBerry(target) {
  const date = new Date();
  const client = await returnBerryClient();
  await client.join(target);
  console.log(`Berry Bot Connected to ${target} chat at ${date}`);
}

async function disconnect(target) {
  const client = await returnBerryClient();
  await client.part(target);
  const date = new Date();
  console.log(`Berry Bot Disconnected from ${target} chat at ${date}`);
}

async function issueChat(channel, message) {
  const client = await returnBerryClient();
  await client.say(channel, message);
}

async function runScheduledCommands(channel, unx_id) {

    const collection = db.collection('user_scheduled_messages')
    const query = ({user_id: unx_id})
    const tasks = await collection.find(query).toArray()

    const client = await returnBerryClient();

    for (let key in tasks) {
      if(tasks[key].active){
        const intervalId = setInterval(async () => {
          await client.say(channel, tasks[key].schedule_message);
          }, parseInt(tasks[key].timer) * 60 * 1000);
  
          if (intervalIds.has(channel)) {
          intervalIds.get(channel).push(intervalId);
          } else {
          intervalIds.set(channel, [intervalId]);
          }
        
        activeCommands.set(channel, tasks);

      } else {
        continue
      }
    }
}

async function stopAllScheduledCommands(channel) {
  const intervalIdsForChannel = intervalIds.get(channel);

  if (intervalIdsForChannel) {
    for (let i = 0; i < intervalIdsForChannel.length; i++) {
      clearInterval(intervalIdsForChannel[i]);
    }
  }

  intervalIds.delete(channel);
  activeCommands.delete(channel);
}

module.exports = {
  connectToBerry,
  disconnect,
  issueChat,
  runScheduledCommands,
  stopAllScheduledCommands
};
