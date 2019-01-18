function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  var url ="/metadata/"+sample;
  console.log(url);
  d3.json(url).then(function(data){
    console.log("metadata",data);

    var metadata = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    metadata.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    var m_data = Object.entries(data);
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    m_data.forEach(function(item) {
    metadata.append("h6").text(item[0]+": "+item[1]);
    })
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    //var url2="//wfreq/"+sample;
    //d3.json(url).then(function(data){
      //console.log("wfreq",data.WFREQ);
    //});
}

function buildGauge(sample){

  var url ="/metadata/"+sample;
  console.log(url);
  d3.json(url).then(function(data){
    console.log("wfreq",data.WFREQ);

  var freq = d3.select("#gauge");
  // Use `.html("") to clear any existing metadata
  freq.html("");

  // Enter a speed between 0 and 9
  var level = data.WFREQ;

  // Trig to calc meter point
  var degrees = 9 - level,
   radius = .5;
  var radians = degrees * Math.PI / 9;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
  pathX = String(x),
  space = ' ',
  pathY = String(y),
  pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
  x: [0], y:[0],
  marker: {size: 28, color:'850000'},
  showlegend: false,
  name: 'speed',
  text: level,
  hoverinfo: 'text+name'},
  { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
  rotation: 90,
  text: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
  textinfo: 'text',
  textposition:'inside',
  marker: {colors:['rgba(0,	128,	0, .8)','rgba(0,	128,	0, .7)','rgba(0,	128,	0, .6)','rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)']},
  labels: ['8-9','7-8','6-7','5-6','4-5','3-4','2-3','1-2','0-1'],
  hoverinfo: 'label',
  hole: .5,
  type: 'pie',
  showlegend: false
}];

var layout = {
  shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
  title: 'Belly Button Washing Frequency Scrubs per week',
  height: 500,
  width: 500,
  xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
  yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
};

Plotly.newPlot('gauge', data, layout);

});
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // @TODO: Build a Bubble Chart using the sample data
  var url = "/samples/"+sample;
  d3.json(url).then(function(data){
    console.log("samples",data);
    trace1=[{
      x:data.otu_ids,
      y:data.sample_values,
      mode: 'markers',
      'hovertext':data.otu_ids,
      "hovertext": data.otu_labels,
      xaxis:"OTU-ID",
      marker: {
        color: data.otu_ids,
        colorscale: "Rainbow",
        size: data.sample_values
      }
    }];
    Plotly.newPlot('bubble', trace1);
  });

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    d3.json(url).then(function(data){
      //descending sort
      var samples= data.sample_values;
      samples.sort(function topvalues(firstNum, secondNum) {
       return secondNum - firstNum;
      });

      //get the first top 10 sample values
      const topsamples = samples.slice(0, 11);
      
      var id=[];
      var label=[];
      var index=[]
      //set id and label values accordding to the index of sample_values
      d3.json(url).then(function(response){
        for (var i=0; i<topsamples.length; i++){
          index.push(response.sample_values.indexOf(data.sample_values[i]));
        }
        for (var x=0; x<index.length; x++){
          id.push(data.otu_ids[index[x]]);
          label.push(data.otu_labels[index[x]]);
        }
        console.log("id label value",id,label,topsamples);

        //build trace and plot the pie chart
        trace2=[{
          values: topsamples,
          labels: id,
          "hovertext": label,
          type: 'pie'
        }];
        Plotly.newPlot('pie', trace2);
    });      
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text("BB-"+sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGauge(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGauge(newSample);
}

// Initialize the dashboard
init();
