// @TODO: YOUR CODE HERE!
  //Setup chart area
  var svgWidth = 960;
  var svgHeight = 500;

  var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

   // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Inital Params

  var chosenXaxis = "poverty";
  var xValue = "poverty";
  var chosenYaxis = "obesity";
  var yValue = "obesity";


  // function used for updating x-scale var upon click on axis label
function xScale(cenData, chosenXaxis) {
  //create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(cenData, d => d[chosenXaxis]) * 0.8,
      d3.max(cenData, d => d[chosenXaxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;
}

function yScale(cenData, chosenYaxis) {
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(cenData, d => d[chosenYaxis])])
  .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXaxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
function renderYaxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {
  circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXaxis]))
      .attr("cy", d => newYScale(d[chosenYaxis]));
  return circlesGroup; };

// function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {

  var xlabel;

  if (chosenXaxis === "poverty") {
    xlabel = "In Poverty (%):";
  }
  else if (chosenXaxis === "age") {
    xlabel = 'Age (Median)'
  }
  else {
    xlabel = "Household Income (Median):";
  }

  var ylabel;

  if (chosenYaxis === "obesity") {
    ylabel = "Obese (%)"
  }
  else if (chosenYaxis === "smokes") {
    ylabel = "Smokes (%)"
  }
  else {
    ylabel = "Lacks Healthcare (%)"
  } 


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>
      </h5> ${ylabel}: ${d[chosenYaxis]} </h5> <br>
      ${xlabel} ${d[chosenXaxis]}`);
    });

  circlesGroup.call(toolTip);
  

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

function updateText(circleLabels, newXScale, newYScale, chosenXaxis, chosenYaxis) {
  circleLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXaxis]))
      .attr("y", d => newYScale(d[chosenYaxis]));
  return circleLabels;
}



d3.csv("D3_data_journalism/assets/data/data.csv").then(function(cenData, err) {
    if (err) throw err;

    var cenData = cenData

    console.log(cenData);

    //1. parse data
    cenData.forEach(function(data) {
      data.income = +data.income;
      data.obesity = +data.obesity  
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.poverty = +data.poverty
    });

  // xLinearScale function above csv import
  var xLinearScale = xScale(cenData, chosenXaxis);

  // Create y scale function
  var yLinearScale = yScale(cenData, chosenYaxis);
  
  console.log(yLinearScale);
    
  
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var axisLeft = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(axisLeft);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
  .data(cenData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXaxis]))
  .attr("cy", d => yLinearScale(d[chosenYaxis]))
  .attr("r", 15)
  .attr("class", "stateCircle")
  .attr("opacity", ".95"); 

  //labes for circles
  var circleLabels = chartGroup.selectAll(null)
    .data(cenData)
    .enter()
    .append("text");

  circleLabels
    .attr("x", function(d) {
      return xLinearScale(d[chosenXaxis]);
    })
    .attr("y", function(d) {
      return yLinearScale(d[chosenYaxis]);
    })
    .text(function(d) {
      return d.abbr;
    })
    .attr("class", "stateText");
  

  // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("classs", "xLabelsGroup")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //Xlabels
    var povertylabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", false)
    .text("In Poverty (%)");

    var agelabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var ylabelsGroup = chartGroup.append("g")
    .attr("classs", "yLabelsGroup");
   // Ylabels
   var obeseLabel = ylabelsGroup.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left)
   .attr("x", 0 - (height / 2))
   .attr("dy", "1em")
   .classed("axis-text active", true)
   .attr("value", "obesity")
   .text("Obese (%)");

   var smokesLabel = ylabelsGroup.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left + 20)
   .attr("x", 0 - (height / 2))
   .attr("dy", "1em")
   .classed("axis-text inactive", false)
   .attr("value", "smokes")
   .text("Smokes (%)");

   var healthcareLabel = ylabelsGroup.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0 - margin.left +40)
   .attr("x", 0 - (height / 2))
   .attr("dy", "1em")
   .classed("axis-text inactive", false)
   .attr("value", "healthcare")
   .text("Lacks Healthcare (%)");

   // updateToolTip function above csv import
   var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

  


   // x axis labels event listener
   xlabelsGroup.selectAll("text")
     .on("click", function() {
       // get value of selection
       var xValue = d3.select(this).attr("value");
       if (xValue === "poverty" || xValue === "age" || xValue === "income") {
 
         // replaces chosenXAxis with value
         chosenXaxis = xValue;
 
         console.log(`chosen X: ${xValue}`);
 
         // functions here found above csv import
         // updates x scale for new data
         xLinearScale = xScale(cenData, chosenXaxis);
 
         // updates x axis with transition
         xAxis = renderXaxes(xLinearScale, xAxis);
 
         // updates circles with new x values
         circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);
 
         // updates tooltips with new info
         circlesGroup =  updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);
 
         // changes classes to change bold text
         if (chosenXaxis === "poverty") {
          povertylabel
             .classed("active", true)
             .classed("inactive", false);
           agelabel
             .classed("active", false)
             .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
         }

         else if (chosenXaxis === "age") {
          povertylabel
             .classed("active", false)
             .classed("inactive", true);
           agelabel
             .classed("active", true)
             .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
         }
         else {
          povertylabel
          .classed("active", false)
          .classed("inactive", true);
        agelabel
          .classed("active", false)
          .classed("inactive", true);
       incomeLabel
       .classed("active", true)
       .classed("inactive", false);
         }

        
         circleLabels = updateText(circleLabels, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);
      }
    
    
    
    })

ylabelsGroup.selectAll("text")
     .on("click", function() {

   ylabelsGroup.selectAll("text")
       .on("click", function() {
      
     var yValue = d3.select(this).attr("value");

       // replaces chosenXAxis with value
       chosenYaxis = yValue;

       console.log(`chosen Y: ${yValue}`);

       // functions here found above csv import
       // updates y scale for new data
       yLinearScale = yScale(cenData, chosenYaxis);

       console.log(yLinearScale);

       // updates y axis with transition
       yAxis = renderYaxes(yLinearScale, yAxis);

       // updates circles with new x values
       circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

       // updates tooltips with new info
       circlesGroup =  updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

       // changes classes to change bold text
       if (chosenYaxis === "obesity") {
        obeseLabel
           .classed("active", true)
           .classed("inactive", false);
         smokesLabel
           .classed("active", false)
           .classed("inactive", true);
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
       }

       else if (chosenYaxis === "smokes") {
        obeseLabel
           .classed("active", false)
           .classed("inactive", true);
          smokesLabel
           .classed("active", true)
           .classed("inactive", false);
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
       }
       else {
        obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
       }

       circleLabels = updateText(circleLabels,  xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);
     
    })
      });


}).catch(function(error) {
  console.log(error);
});