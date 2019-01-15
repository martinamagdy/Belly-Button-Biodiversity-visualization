function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  var url ="/metadata/"+sample;
  console.log(url);
  d3.json(url).then(function(data){
    console.log(data);
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
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // @TODO: Build a Bubble Chart using the sample data
  var url = "/samples/"+sample;
  d3.json(url).then(function(data){
    console.log(data);
    trace1=[{
      x:data.otu_ids,
      y:data.sample_values,
      mode: 'markers',
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
      const topsamples = samples.slice(0, 10);
      
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
        console.log("id label",id,label);

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
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
