var margin= {top: 20,right: 80, bottom: 30, left: 50},
    width =  960,
    height = 500,
    xValue = undefined,
    yValue = undefined,
    xScale = d3.time.scale(),
    yScale = d3.scale.linear(),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
    yAxis = d3.svg.axis().scale(yScale).orient("left"),
    line = d3.svg.line().x(X).y(Y),
    lineWrapper = function(d) { return line(d.values);}
svg = undefined;
gEnter = undefined;
g = undefined;
color =  d3.scale.category10(),
    channels = new Array();


function chart(selection) {

    selection.each(function(json) {
        channels.push(json[0]);

        // Update the x-scale.
        xScale
            .domain(d3.extent(channels[0].values, xValue))
            .range([0, width - margin.left - margin.right]);

        // Update the y-scale.
        yScale
            .domain([
                d3.min(channels, function (d) {
                    return d3.min(d.values, yValue)
                }),
                d3.max(channels, function (d) {
                    return d3.max(d.values, yValue)
                })
            ])
            .range([height - margin.top - margin.bottom, 0]);


        // Select the svg element, if it exists.
        svg = d3.select(this).selectAll("svg").data(channels);

        // ENTER STATE  - otherwise, create skeletal
        gEnter = svg.enter()
            .append("svg")
            .append("g");

        gEnter.append("g").attr("class", "channels")
            .append("path").attr("class", "line");
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");

        // UPDATE STATE

        //upate outer dimensions
        svg.attr("width", width)
            .attr("height", height);

        //update inner dimensions
        g = svg.select("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //update line path
        g.selectAll(".line")
            .attr("d", function(d) { return line(d.values);})
            .style("stroke", function(d) { return color(d.name); });

        //update x-axes
        g.select(".x.axis")
            .attr("transform", "translate(0," + yScale.range()[0] + ")")
            .call(xAxis);

        g.select(".y.axis")
            .call(yAxis);
    });
}

// The x-accessor for the path generator; xScale ∘ xValue.
function X(d) {

    return xScale(d.date);
}

// The x-accessor for the path generator; yScale ∘ yValue.
function Y(d) {
    return yScale(+d.column);
}

chart.width = function(){
    return width;
}

chart.height = function(){
    return height;
}

chart.xScale = function(){
    return xScale;
}

chart.yScale = function(){
    return yScale;
}


chart.xAxis = function(){
    return xAxis;
}

chart.yAxis = function(){
    return yAxis;
}

chart.g = function(){
    return g;
}

chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
};

chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
};

chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
};

chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
};

chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
};

chart.column = function(_){
    if (!arguments.length) return yValue;
    column = _;
    return chart;
}

chart.line = function(){
    return line;
}

chart.svg = function(){
    return svg;
}

chart.lineWrapper = function(){
    return lineWrapper;
}

chart.gEnter = function(){
    return gEnter;
}

chart.update = function(){

}

chart.addColumn = function(column){

    d3.json(serverUrl+"/get-data?column="+column.name, function(error, json) {
        if (error) return console.warn(error);
        channels.push(json.columns[0]);

        xScale
            .domain(d3.extent(channels[0].values, xValue))

        yScale.domain([
            d3.min(channels, function (d) {
                return d3.min(d.values, yValue)
            }),
            d3.max(channels, function (d) {
                return d3.max(d.values, yValue)
            })
        ]);

        g.selectAll(".line")
            .data(channels)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values);})
            .style("stroke", function(d) { return color(d.name); });
    })
}

return chart;