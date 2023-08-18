const eris = require('eris');
require('dotenv').config();
const QuickChart = require('quickchart-js');
const MessageEmbed = require("davie-eris-embed");
var leven = require("leven");

var fs=require('fs');
var data=fs.readFileSync('subjects_and_courses.json', 'utf8');
var dictObj=JSON.parse(data);

var path = './src/subjects.txt';
var autocorrect = require('autocorrect')({dictionary: path});

const BOT_TOKEN = process.env.TOKEN;
const PREFIX = process.env.PRE;
const GUILD_ID = process.env.GUILD_ID

function auto(str, obj) {
    for(x = 0; x < obj.length; x++) {
        var distance, bestWord, word, min
        word = obj[x]
        distance = leven(str, word)

        if (distance === 0) {
            return word
        } else if (min === undefined || distance < min) {
            min = distance
            bestWord = word
        }
    }    
    return bestWord;
}

//COURSE command handling
async function course (c) {
    //GET course data with CougarGrades API
    if(!c.includes(' ')) {
        var space = c.search(/\d/);
        c = c.slice(0, space) + " " + c.slice(space);
    }
    const url = 'https://api.cougargrades.io/catalog/getCourseByName?courseName=' + c.replace(' ', '%20').toUpperCase();

    //new blank red embed
  let embed = { color: 0xff0000 };

  const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          },
      body: JSON.stringify({a: 1, b: 'Textual content'})
  });
    try { //try to parse JSON
        const content = await rawResponse.json();

        //data for chart
        const totalEnrolled = content.enrollment.totalEnrolled;
        const totalA = content.enrollment.totalA;
        const totalB = content.enrollment.totalB;
        const totalC = content.enrollment.totalC;
        const totalD = content.enrollment.totalD;
        const totalF = content.enrollment.totalF;
        const totalS = content.enrollment.totalS;
        const totalNCR = content.enrollment.totalNCR;
        const totalW = content.enrollment.totalW;

        //chart is pretty hard-coded, works though
        const chart = new QuickChart();
        var barOptions_stacked = {
            tooltips: {
                enabled: false
            },
            layout: {
                padding: 10
            },
            scales: {
                xAxes: [{
                    offset: true,
                    
                    ticks: {
                        min:0,
                        max: totalEnrolled,
                        stepSize: 2,
                        display: false
                    },
                    scaleLabel:{
                        display:false
                    },
                    gridLines: {
                        display:false,
                        color: "#fff",
                        zeroLineColor: "#fff",
                        zeroLineWidth: 0
                    }, 
                    stacked: true,
                    label: false
                }],
                yAxes: [{
                    gridLines: {
                        display:false,
                        color: "#fff",
                        zeroLineColor: "#fff",
                        zeroLineWidth: 0
                    },
                    ticks: {
                        min:0,
                        max: totalEnrolled,
                        stepSize: 1,
                        display: false
                    },
                    stacked: true,
                }]
            },
            legend:{
                position: 'bottom',
                    labels: {
                        fontSize: 20,
                        fontStyle: 'bold',
                        boxWidth: 5,
                        usePointStyle: true
                    }
            },
        }
        chart.setConfig({
            type: 'horizontalBar',
            data: {
                labels: [" "],
                
                datasets: [{
                    label: 'A: ' + (totalA/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalA],
                    backgroundColor: "rgb(135, 206, 250)",
                },{
                    label: 'B: ' + (totalB/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalB],
                    backgroundColor: "rgb(144, 238, 144)",
                },{
                    label: 'C: ' + (totalC/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalC],
                    backgroundColor: "rgb(255, 255, 0)",
                },{
                    label: 'D: ' + (totalD/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalD],
                    backgroundColor: "rgb(255, 160, 122)",
                },{
                    label: 'F: ' + (totalF/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalF],
                    backgroundColor: "rgb(205, 92, 92)",
                },{
                    label: 'S: ' + (totalS/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalS],
                    backgroundColor: "rgb(143, 188, 143)",
                },{
                    label: 'NCR: ' + (totalNCR/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalNCR],
                    backgroundColor: "rgb(216, 112, 147)",
                },{
                    label: 'W: ' + (totalW/totalEnrolled*100).toFixed(1) + '%',
                    data: [totalW],
                    backgroundColor: "rgb(147, 112, 216)",
                }]
            },
            options: barOptions_stacked,
        }).setWidth(800).setHeight(125);

        //add course info and chart to embed
        embed.title = content.description;
        embed.description = content._id;
        embed.url = "https://cougargrades.io/c/" + c.replace(' ', '%20').toUpperCase();
        embed.fields = [{name: 'Average GPA: ' + content.GPA.average.toFixed(4) ,
                        value: content.GPA.standardDeviation.toFixed(3) + ' SD  |  ' + (totalW/totalEnrolled*100).toFixed(2) + '% W',
                        inline: true},
                    {name: "We\\'re migrating to slash commands!", value: "Try: /course"}];
        embed.image = {url: chart.getUrl()};

        //return happy embed :)
        return embed;
    } 
    catch (e) { //handles mispelling
        //use autocorrect on 'subject' and remove new line
        corrected = autocorrect(c.substring(0, c.indexOf(' ')+1).toUpperCase()).replace(/(\r\n|\n|\r)/gm, "");
        correctCourse = c.substring(c.indexOf(' ')+1);
        try { //try to correct course number based on corrected subject
            let subject = dictObj.find(el => el.name === corrected);
            newCourse = await auto(correctCourse, subject.number);
            correctCourse = newCourse;
	    console.log(corrected + " " + correctCourse);
        }
        catch(e) {
            console.log(e);
        }

        //suggest correct course
        embed.title = 'Course not found :(';
        embed.description = "Did you mean: " + corrected + " " + correctCourse + "?";

        //return error embed with suggested course
        return embed;
    }
};

//bot connection
const bot = new eris.Client(BOT_TOKEN);
bot.on('ready', async () => {
 
  try {
    // await bot.deleteGuildCommand(GUILD_ID, "1141871937753186435");
    await bot.createGuildCommand(GUILD_ID, {
        name: "servers",
        type: eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
        description: "Check the bot's server count."
    });

    await bot.createGuildCommand(GUILD_ID, {
        name: "course",
        type: eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
        description: "Get quick course information.",
        options: [{type: 3, name:"course", description:"EX: 'COSC 3320'"}]
    });

    (async () => {
        await bot.guilds; // update the chache for accurate info.
        let serverCount = bot.guilds.size;
        bot.editStatus('online', {
            name: serverCount + ' servers',
            type: 2 //"Listening to"
        });
    })()

    console.log('Connected and ready.');
  } catch (err) {
    console.error(err);
  };
});

bot.on("interactionCreate", interaction => {
    if (interaction instanceof eris.CommandInteraction) {
        if (interaction.data.name == "servers") {
            (async () => {
                await bot.guilds; // update the chache for accurate info.
                let serverCount = bot.guilds.size;
                bot.editStatus('online', {
                    name: serverCount + ' servers',
                    type: 2 //"Listening to"
                });
                console.log(interaction.data.name + ": " + serverCount);
                return interaction.createMessage("I'm in " + serverCount + " servers. Thanks for asking!")
            })()
        }
        else if (interaction.data.name = "course") {
            (async () => {
                const message = await course(interaction.data.options[0].value);
                console.log(interaction.data.name + ": " + interaction.data.options[0].value);
                return interaction.createMessage({embed: message});
            })()
        }
    }
});

const commandHandlerForCommandName = {};

//'course' handler
commandHandlerForCommandName['course'] = (msg, args) => {
    (async () => {
        const message = await course(args);
        return msg.channel.createMessage({embed: message});
    })()
}

//'servers' handler
commandHandlerForCommandName['servers'] = (msg, args) => {
    (async () => {
        await bot.guilds; // update the chache for accurate info.
        let serverCount = bot.guilds.size;
        bot.editStatus('online', {
            name: serverCount + ' servers',
            type: 2 //"Listening to"
        });
        return msg.channel.createMessage("I'm in " + serverCount + " servers. Thanks for asking!")
    })()
}

let help = {    color: 0xff0000,
                title: "Cougar Grades Bot Help",
                description: "prefix: 'cg!' for all commands\n\n**cg!help**\nHopefully you know what this does\n\n**cg!course < SUBJECT #### >**\nShows quick info for any UH course\n*i.e. cg!course COSC 3320*\n\n**cg!servers**\nTells your how many servers this cool cat is in\n\n*Want to invite me to your server? Click my profile*\nDeveloped by: <@431161357879214080>"
};

//'help' handler
commandHandlerForCommandName['help'] = (msg, args) => {
    return msg.channel.createMessage({embed: help});
}
commandHandlerForCommandName[''] = (msg, args) => {
    return msg.channel.createMessage({embed: help});
}

//on every message
bot.on('messageCreate', async (msg) => {
    //ignore bots
    if(msg.author.bot) { return; }

    //store content if not bot
    content = msg.content;

    // Ignore any message that doesn't start with the correct prefix.
    if (!content.startsWith(PREFIX)) { return; }
        commandName = '';

    // Extract the parts of the command and the command name
    if(msg.content.indexOf(' ') != -1) { commandName = msg.content.substring(PREFIX.length, msg.content.indexOf(' ')); }
    else { commandName = msg.content.substring(PREFIX.length); }

    // Get the appropriate handler for the command, if there is one.
    const commandHandler = commandHandlerForCommandName[commandName];
    if (!commandHandler) { return; }

    // Separate the command arguments from the prefix and command name.
    const args = msg.content.substring(msg.content.indexOf(' ') + 1);
    console.log(commandName + ": " + args);

    try { await commandHandler(msg, args);}
    catch (err) {
        console.warn('Error handling command');
        console.warn(err);
    }
});

bot.on('error', err => {
  console.warn(err);
});

bot.connect();
