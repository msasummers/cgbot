const eris = require('eris');
require('dotenv').config();

const BOT_TOKEN = process.env.TOKEN;
const PREFIX = process.env.PRE;

//COURSE command handling
async function course (c) {
  c = c.replace(' ', '%20');
  const url = 'https://api.cougargrades.io/catalog/getCourseByName?courseName=' + c.toUpperCase();

  message = "Course not found.";

  const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          },
      body: JSON.stringify({a: 1, b: 'Textual content'})
  });
  try {
    const content = await rawResponse.json();
    message = content.description 
      + '\n' + content._id 
      + '\nAverage GPA: ' 
      + (content.GPA.average).toFixed(2) 
      + '\nSee More: https://cougargrades.io/c/' + c.toUpperCase();
  } catch (e) {
    console.log(e);
  }

  return message;
};

//bot connection
const bot = new eris.Client(BOT_TOKEN);
bot.on('ready', () => {
  console.log('Connected and ready.');
});

const commandHandlerForCommandName = {};

// commandHandlerForCommandName['say'] = (msg, args) => {
//   const message = args;
//   console.log('its gamin time. ' + message);

//   // TODO: Handle invalid command arguments, such as:
//   // 1. No mention or invalid mention.
//   // 2. No amount or invalid amount.

//   return msg.channel.createMessage(message);
// };

//CALL course Function
commandHandlerForCommandName['course'] = (msg, args) => {
  (async () => {
    const message = await course(args)
    console.log("Sending: " + message);
    return msg.channel.createMessage(message);
  })()
}

//on every message
bot.on('messageCreate', async (msg) => {
  //ignore bots
  if(msg.author.bot) { return; }

  //store content if not bot
  content = msg.content;

  // Ignore any message that doesn't start with the correct prefix.
  if (!content.startsWith(PREFIX)) { return; }

  // Extract the parts of the command and the command name
  const commandName = msg.content.substring(PREFIX.length, msg.content.indexOf(' '));
  console.log("command: " + commandName);

  // Get the appropriate handler for the command, if there is one.
  const commandHandler = commandHandlerForCommandName[commandName];
  if (!commandHandler) {
      return;
  }

  // Separate the command arguments from the command prefix and command name.
  const args = msg.content.substring(msg.content.indexOf(' ') + 1);
  console.log("args: " + args);

  try {
      // Execute the command.
      await commandHandler(msg, args);
  } catch (err) {
      console.warn('Error handling command');
      console.warn(err);
  }
});

bot.on('error', err => {
  console.warn(err);
});

bot.connect();