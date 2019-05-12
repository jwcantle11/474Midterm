(function() {
  let svgBarPlot = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgBarPlot = d3
      .select("body")
      .append("svg")
      .attr("width", 700)
      .attr("height", 700);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/simpsons.csv").then(csvData => {
      makeBarPlot(csvData);
    });
  };

  //   PLOT
  function makeBarPlot(data) {
    let years = data.map(row => parseInt(row["Year"]));
    let viewers = data.map(row => parseFloat(row["Avg. Viewers (mil)"]));
    let axesLimits = findMinMax(years, viewers);
    // want minimum to be 0 for y
    axesLimits.yMin = 0;

    let funcs = drawAxes(
      axesLimits,
      "Year",
      "Avg. Viewers (mil)",
      svgBarPlot,
      { min: 50, max: 650 },
      { min: 50, max: 650 }
    );
    console.log(data);
    plotData(funcs, viewers, years, data);
    drawAverage(funcs);
    makeLabels();
  }

  function drawAverage(funcs) {
    let yMap = funcs.y;
    console.log(yMap);

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    svgBarPlot
      .append("line")
      .attr("x1", 50)
      .attr("x2", 650)
      .attr("y1", yMap(13.46))
      .attr("y2", yMap(13.46))
      .style("stroke-dasharray", "10,5")
      .style("stroke", "gray")
      .style("stroke-width", 3)
      .on("mouseover", d => {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.99);
        div
          .html("<strong>Average = 13.46</strong>")
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY + "px")
          .style("background", "rgba(255, 255, 255, 0.85)")
          .style("height", "20px")
          .style("width", "130px")
          .style("box-shadow", " 0 0 5pt 3pt rgba(41, 121, 255, 0.5)")
          .style("font-size", "16px");
      })
      .on("mouseout", d => {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  function plotData(mapFunctions, y, x, all) {
    let data = [];
    console.log(all);

    // Set Colors
    for (let i = 0; i < y.length; i++) {
      let fill = "#6AADE4";
      if (all[i]._Data === "Estimated") {
        fill = "#8F8782";
      }
      let a = [x[i], y[i], fill];
      data.push(a);
      all[i]["fill"] = fill;
    }
    console.log(all);

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let xMap = mapFunctions.x;
    let yMap = mapFunctions.y;

    svgBarPlot
      .selectAll(".dot")

      .data(all)
      .enter()
      .append("text")
      .attr("x", d => xMap(parseFloat(d.Year)))
      .attr("y", d => yMap(parseFloat(d["Avg. Viewers (mil)"])) - 5)
      .style("font-size", "6pt")
      .style("text-align", "center")
      .text(d => parseFloat(d["Avg. Viewers (mil)"]));

    // append data to SVG and plot as points
    svgBarPlot
      .selectAll(".dot")
      .data(all)
      .enter()
      .append("rect")
      .attr("x", d => xMap(parseFloat(d.Year)))
      .attr("y", d => yMap(parseFloat(d["Avg. Viewers (mil)"])))
      .attr("width", 15)
      .attr("height", d => 650 - yMap(parseFloat(d["Avg. Viewers (mil)"])))
      // .attr("r", d => pop_map_func(d["pop_mlns"]))
      .attr("fill", d => d.fill)
      .style("stroke-width", 1)
      .style("stroke", "black")
      .on("mouseover", d => {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.99);
        div
          .html(
            "<strong>Season #" +
              d.Year +
              "</strong><br/>Year: " +
              d.Year +
              "</br>Episodes: " +
              d.Episodes +
              "</br>Avg Viewers(mil): " +
              d["Avg. Viewers (mil)"] +
              "</br></br>Most Watched Episode: " +
              d["Most watched episode"] +
              "</br>Viewers: " +
              d["Viewers (mil)"]
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 100 + "px")
          .style("background", "rgba(255, 255, 255, 0.85)")
          .style("height", "150px")
          .style("width", "240px")
          .style("font-size", "16px")
          .style("box-shadow", " 0 0 5pt 3pt rgba(41, 121, 255, 0.5)");
      })
      .on("mouseout", d => {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  function makeLabels() {
    svgBarPlot
      .append("text")
      .attr("x", 50)
      .attr("y", 30)
      .style("font-size", "20pt")
      .text("The Simpsons Average Viewership By Season");

    svgBarPlot
      .append("text")
      .attr("x", 250)
      .attr("y", 695)
      .style("font-size", "16pt")
      .text("Year of Season");

    svgBarPlot
      .append("text")
      .attr("transform", "translate(15, 450)rotate(-90)")
      .style("font-size", "16pt")
      .text("Avg. Viewers (in millions)");
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {
    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: 2015,
      yMin: yMin,
      yMax: 30
    };
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function(d) {
      return +d[x];
    };

    // function to scale x value
    let xScale = d3
      .scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) {
      return xScale(d);
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg
      .append("g")
      .attr("transform", "translate(0, " + rangeY.max + ")")
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {
      return +d[y];
    };

    // function to scale y
    let yScale = d3
      .scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function(d) {
      return yScale(d);
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg
      .append("g")
      .attr("transform", "translate(" + rangeX.min + ", 0)")
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }
})();
