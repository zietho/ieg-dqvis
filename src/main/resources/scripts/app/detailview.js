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

        layers.graph = function(){
            // update x and y scales (i.e, domain + range)
            xScale
                .domain(d3.extent(channels[0].values, xValue))
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

            //update axes
            d3.select(".x.axis").call(xAxis);
            d3.select(".y.axis").call(yAxis);


            //update line path
            var paths = g.selectAll("path.line")
                .data(channels);

            //add new ones
            var pathsEnter = paths
                .enter()
                .append("path")
                .classed("line", true)
                .attr("id", function(d){
                    return d.name;
                })
                //.transition()
                .attr("d", function (d) {
                    return line(d.values);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                });

            d3.transition().selectAll("path.line")
                .attr("d", function (d) {
                    return line(d.values);
                })

            paths.exit().remove();

        }

        layers.labels = function(){
            var labels = g.selectAll("text.label")
                .data(channels)

            var labelsEnter = labels
                .enter()
                .append("text")
                .classed("label", true)
                .attr("transform", function(d){
                    return "translate(" + (width+3) + "," + Y(d.values[d.values.length-1]) + ")"
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", function (d) {
                    return color(d.name);
                })
                .text(function(d){
                    return d.name;
                });

            labels.exit().remove();
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

                updateChannels(data);
                layers.graph();
                layers.labels();

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

                //change columns here.....
                updateChannels(json.columns[0]);
                layers.graph(channels);
                layers.labels();
            })

        }

        chart.setRange = function (range){
            var min = range[0];
            var max = range[1];
            var url = serverUrl + "/get-data?"; //start building the URL

            //Channels/Columns
            channels.forEach(function(element,index,array){
                url+= "column="+element.name+"&";
            });

            //From - To
            if(min>=0 && min < max) {
                url += "from="+min;
            }
            if(min<max && max<=100){
                url += "&to="+max;
            }

            url += "&granularity=auto&load=individually";

            //load all stripe and draw the quality view
            d3.json(url, function (error, json) {
                if (error) return console.warn(error);

                json.columns.forEach(function(element,index,array){
                   updateChannels(element);
                });

                //update data
                layers.graph();
            });
         }

        return chart;
    }

    return detailView;

});