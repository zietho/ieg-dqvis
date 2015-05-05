//function QualityBarView() {
define(['d3'], function (d3) {

    function detailView() {

        var margin = {top: 20, right: 80, bottom: 80, left: 50},
            width,
            height,
            xValue,
            yValue,
            xScale = d3.time.scale(), //set x-scale and range
            yScale = d3.scale.linear(), //set y-scale and range
            xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
            yAxis = d3.svg.axis().scale(yScale).orient("left"),
            line = d3.svg.line().x(X).y(Y),
            svg,
            g,
            layers = {},
            color = d3.scale.category10(),
            channels = [],
            serverUrl;

        /*  LAYERS  */

        layers.graph = function(data){

            //first update the channels array
            updateChannels(data);

            // update x and y scales (i.e, domain + range)
            xScale
                .domain(d3.extent(data.values, xValue))
                .range([0,width]);

            yScale
                .domain([
                    d3.min(channels, function (d) {
                        return d3.min(d.values, yValue)
                    }),
                    d3.max(channels, function (d) {
                        return d3.max(d.values, yValue)
                    })
                ])
                .range([height, 0]);

            var test = d3.select(".x.axis").call(xAxis);
            var test2 = d3.select(".y.axis").call(yAxis);


            //update line path
            var paths = g.selectAll("path.line")
                .data(channels);

            //add new ones
            var pathsEnter = paths
                .enter()
                .append("path")


                pathsEnter
                .classed("line", true)
                .attr("id", function(d){
                    return d.name;
                })
                .attr("d", function (d) {
                    return line(d.values);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                });




            paths.exit().remove();
                //g.append("text")
                //.attr("transform", "translate(" + (width+3) + "," + y(data[0].open) + ")")
                //.attr("dy", ".35em")
                //.attr("text-anchor", "start")
                //. style("fill", function (d) {
                //        return color(d.name);
                //})
                //.text(data.name);
        }

        layers.axes = function(){
            //x-axis
            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            //y-axis
            g.append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Value");
        }

        function chart(selection) {
            selection.each(function (data) {

                // Select the svg element, if it exists.
                svg = d3.select(this)
                    .append("svg")
                    .attr("id", "detailView")
                    .attr("width", width+margin.right)
                    .attr("height", height+margin.bottom);

                //update inner dimensions
                g = svg
                    .append("g")
                    .attr("id","detailViewCanvas")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                layers.axes();
                layers.graph(data);
            });
        }

        function updateChannels(data){

            var contained = false;
            channels.forEach(function(element,index,array){
                  if(element.name==data.name) {
                      element.values = data.values;
                      contained = true;
                  }
            });

            if(!contained){
                channels.push(data);
            }
        }

        // The x-accessor for the path generator; xScale ∘ xValue.
        function X(d) {
            return xScale(d.date);
        }

        // The x-accessor for the path generator; yScale ∘ yValue.
        function Y(d) {
            return yScale(+d.column);
        }

        chart.width = function () {
            return width;
        }

        chart.height = function () {
            return height;
        }

        chart.xScale = function () {
            return xScale;
        }

        chart.yScale = function () {
            return yScale;
        }

        chart.xAxis = function () {
            return xAxis;
        }

        chart.yAxis = function () {
            return yAxis;
        }

        chart.g = function () {
            return g;
        }

        chart.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };

        chart.width = function (_) {
            if (!arguments.length) return width;
            width = _;
            return chart;
        };

        chart.height = function (_) {
            if (!arguments.length) return height;
            height = _;
            return chart;
        };

        chart.x = function (_) {
            if (!arguments.length) return xValue;
            xValue = _;
            return chart;
        };

        chart.y = function (_) {
            if (!arguments.length) return yValue;
            yValue = _;
            return chart;
        };

        chart.column = function (_) {
            if (!arguments.length) return yValue;
            column = _;
            return chart;
        }

        chart.serverUrl = function (_) {
            if (!arguments.length) return serverUrl;
            serverUrl = _;
            return chart;
        }

        chart.addColumn = function (column) {
            d3.json(serverUrl + "/get-data?column="+column+"&granularity=minute&load=individually", function (error, json) {
                if (error) return console.warn(error);
                layers.graph(json.columns[0]);
            })
        }

        return chart;
    }

    return detailView;

});