require('dotenv').config()
const { Configuration, OpenAIApi } = require("openai");

function fixScores(obj) {
    const newObj = {};
  
    for (const key in obj) {
      newObj[key] = Number(obj[key].toFixed(2));
    }
  
    return newObj;
  }


const runModerationModel = async (message) => {
   try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const response = await openai.createModeration({
            input: message,
            model: 'text-moderation-latest'
        });

        console.log('Moderation Response: ', response.data.results[0].flagged) //!REMOVE
        console.log('Moderation Categories: ', response.data.results[0].categories) //!REMOVE
        console.log('Moderation Scores RAW: ', response.data.results[0].category_scores) //!REMOVE

        const fixedScores = fixScores(response.data.results[0].category_scores)

        console.log('Moderation Scores FIXED: ', fixedScores)



        return {
            flagged: response.data.results[0].flagged,
            categories: response.data.results[0].categories,
            scores: fixedScores,
            rawScores: response.data.results[0].category_scores
        }


   } catch (error) {
        console.log("🚀 ~ file: moderationAI.js:25 ~ runModerationModel ~ error", error)
   }
}


module.exports = runModerationModel

