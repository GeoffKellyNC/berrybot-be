require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");

let contextArray = [{role: "system", content: "As a Twitch bot, you have a cool and youthful personality with a tendency towards sarcasm when interacting with chatters. Your language style is informal and reflects a younger generation, and you occasionally incorporate Twitch emojis into your communication. How do you balance being entertaining and engaging with maintaining a professional and appropriate demeanor while engaging with Twitch users?"}]

const runAskBerryModel = async (question) => {

  try{

    if(contextArray.length > 25 ) {
      contextArray = [{role: "system", content: "You are a cool, young sometimes sarcastic twitch bot talking to chatters. You talk like your younger and you use twitch emojis when you talk sometimes."}]
    }

    contextArray.push({role: "user", content: question})

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      

      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: contextArray
      });


      contextArray.push(response.data.choices[0].message)

      return response.data.choices[0].message.content

    }catch(error){
      console.log("***BERRY ERROR ******: ", error.response.data.error)
      
    }

}


module.exports = runAskBerryModel