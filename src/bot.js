const eris = require('eris');
require('dotenv').config();
const QuickChart = require('quickchart-js');
const MessageEmbed = require("davie-eris-embed");
var leven = require("autocorrect/node_modules/leven");

var fs=require('fs');
var data=fs.readFileSync('subjects_and_courses.json', 'utf8');
var dictObj=JSON.parse(data);
// console.log(data);

var path = './src/subjects.txt';
var autocorrect = require('autocorrect')({dictionary: path});

const BOT_TOKEN = process.env.TOKEN;
const PREFIX = process.env.PRE;

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
            inline: true}];
        embed.image = {url: chart.getUrl()};

        //return happy embed :)
        return embed;
    } 
    catch (e) { //handles mispelling
        //use autocorrect on 'subject' and remove new line
        corrected = autocorrect(c.substring(0, c.indexOf(' ')+1).toUpperCase()).replace(/(\r\n|\n|\r)/gm, "");
        correctCourse = c.substring(c.indexOf(' ')+1);
        try { //try to correct course number based on corrected subject
            console.log(corrected);
            let subject = dictObj.find(el => el.name === corrected);
            console.log(subject.number);
            newCourse = await auto(correctCourse, subject.number);
            correctCourse = newCourse
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
bot.on('ready', () => {
  console.log('Connected and ready.');
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