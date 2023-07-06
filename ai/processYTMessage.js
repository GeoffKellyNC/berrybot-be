const YouTubeModel = require('../models/YouTube/Youtube');
const consoleLoging = require('../helpers/consoleLoging');

const processYTMessage = async (type, queue) => {
  if (!type) {
    console.log('⛔️ STOPPING PROCESSING!');
    return false;
  }

  if (queue.size() === 0) {
    console.log('🚧 No messages in Queue. Checking again...');
    return;
  }

  const message = queue.dequeue();
  console.log('🚧 Processing Message:', message);
  queue.setProcessed(message.messageId);
};


module.exports = processYTMessage;
