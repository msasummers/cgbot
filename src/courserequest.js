async function course (c) {
    c = c.replace(' ', '%20');
    const url = 'https://api.cougargrades.io/catalog/getCourseByName?courseName=' + c.toUpperCase();

    const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            },
        body: JSON.stringify({a: 1, b: 'Textual content'})
    });
    try {
    const content = await rawResponse.json();
    // console.log(content);
    
    console.log(content.description);
    console.log(content._id);
    console.log(content.GPA.average);
    } catch (e){
        console.log(e);
    }

  };

course('math 4322');

const totalEnrolled = 2758;
const totalA = 801;
const totalB = 887;
const totalC = 390;
const totalD = 93;
const totalF = 65;
const totalS = 153;
const totalNCR = 0;
const totalW = 369;

const QuickChart = require('quickchart-js');

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
                fontSize: 10,
                boxWidth: 10,
                usePointStyle: true
            }
    },
}

chart
  .setConfig({
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
})
  .setWidth(800)
  .setHeight(50);

// Print the chart URL
console.log(chart.getUrl());
// console.log(chartUrl);
