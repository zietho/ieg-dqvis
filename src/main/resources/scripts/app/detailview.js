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
            serverUrl,
            active = false,
            draggedChannel,
            min,
            max,
            definedLine,
            missingTimeStamps = [],
            useCoalitionLabels = true,
            cutoff = 50;


        /*  LAYERS  */

        layers.graph = function(){


            line.defined(function(d){
                var missing = true;
                d.affectingIndicators.forEach(function (element, index, array) {
                    if (element == "$.MissingData" || element == "MissingTimeStamp") {
                        missing = false;
                    }

                    //box einfuegen!
                })
                return missing;
            })



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
                })
                .style("stroke-width", 2)
                .on("click", function(d){
                    var selectedPath = d3.select(this);

                    //remove all old remove buttons and
                    d3.select("#detailViewCanvas").selectAll(".removeButton").remove();
                    d3.selectAll(".line").transition().style("stroke-width", 2)

                    if(selectedPath.style("stroke-width")==="2px") {
                        selectedPath.transition().style("stroke-width", 4);
                        addRemoveButton(selectedPath);
                    }else{
                        selectedPath.transition().style("stroke-width", 2);
                    }
                })

            d3.transition().selectAll("path.line")
                .attr("d", function (d) {
                    return line(d.values);
                })

            paths.exit().remove();
        }

        function removeChannel(selectedPath){
            var id = selectedPath.attr("id");
            channels.forEach(function(column,index,array){
                if(column.name==id) {
                   channels.splice(index,1);
                    selectedPath.remove();
                }
            });

            d3.selectAll(".label").each(function(d,i){
                if(d.name==id){
                    this.remove();
                }
            })
        }

        function addRemoveButton(selectedPath){
            var data = selectedPath.data()[0];
            var y = Y(data.values[data.values.length-1]);

            var removeButton =  d3.select("#detailViewCanvas")
                .append("g")
                .classed("removeButton", true)
                .attr("transform", "translate(" + (width+3) + "," + y + ")")
                .attr("dy", ".35em")
                .on("click", function(){
                    removeButton.remove();
                    removeChannel(selectedPath);
                });

            /*Create the circle for each block */
            var circle = removeButton.append("circle")
                .attr("r", 10 )
                .attr("cy",2)
                .attr("fill", selectedPath.style("stroke"))
                .classed("removeCircle", true);


            /* Create the text for each block */
            var text = removeButton.append("text")
                .attr("dx", -5)
                .attr("dy", 8)
                .text("X")
                .classed("removeText", true);
        }

        //to display missing values
        layers.missingValues = function(){

            //deep clone object, because of pass by reference
            var missingDataValues = JSON.parse(JSON.stringify(channels)).filter(function(d) {
                d.values = d.values.filter(function (value) {
                    if (value.affectingIndicators.indexOf("$.MissingData") > -1){
                        return value
                    }
                });

                if(d.values.length>0)
                    return d;
            });


            missingDataValues.forEach(function(channel){
                var n = channel.values.length; //population
                channel.values.forEach(function(d){
                    d["confidence"] = se95(d.column,n);
                });
            })

            console.info(missingDataValues);
            console.log("HALLLOO");

            //update line path
            missingDataValues.forEach(function(channel, index, array) {
                var missingDataDots = g.selectAll("missingDataDots-"+channel.name)
                    .data(channel.values);

                //add new ones
                missingDataDots
                    .enter()
                    .append("circle")
                    .classed("missingDataDots-"+channel.name, true)
                    .attr("id", function (d) {
                        return channel.name + ".dots";
                    })
                    .attr("cx", function (d) {
                        return X(d);
                    })
                    .attr("cy", function (d) {
                        return Y(d)
                    })
                    .attr("r", 1.5)
                    .style("stroke", function (d) {
                        return color(channel.name);
                    })


                d3.transition().selectAll(".missingDataDots-"+channel.name)
                    .attr("cx", function (d) {
                        return X(d);
                    })
                    .attr("cy", function (d) {
                        return Y(d)
                    })

                missingDataDots.exit().remove();

                var confidenceArea = d3.svg.area()
                    .interpolate(channel.values)
                    .x(function(d) { return X(d); })
                    .y0(function(d) {
                        return y(d.column - d.confidence); })
                    .y1(function(d) {
                        return y(d.column + d.confidence); });

                g.append("path")
                    .attr({
                        "class": "area confidence",
                        "fill" : "#2B83BA",
                        "d"    : confidenceArea
                    })


            })
        }

        //to display missing timestamps
        layers.missingTimeStampMarker = function(){

            //only get first channel! because we only need to do this once, as a missing time stamp spans over all channels
            var channel = channels[0];

            var mtMarker = g.selectAll(".mtMarker")
                .data(channel.values.filter(function(d){
                    if(d.affectingIndicators.indexOf("MissingTimeStamp")>-1)
                        return d
                }))

            console.info("only the missing time stamps:" + mtMarker);
            console.log("HALLO");

            mtMarker
                .enter()
                .append("text")
                .classed("mtMarker", true)
                .attr("x", function(d){
                    return X(d);
                })
                .attr("y", height+5)
                .style("fill","red")
                .text("X");

            d3.transition().selectAll(".mtMarker")
                .attr("x", function(d){
                    return X(d);
                })

            mtMarker.exit().remove();
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

            d3.transition().selectAll("text.label")
                .attr("transform", function(d){
                    return "translate(" + (width+3) + "," + Y(d.values[d.values.length-1]) + ")"
                })

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

                svg
                    .on("mouseover", function(node) {
                        overDetailView(node);
                    })
                    .on("mouseup", function(node) {
                        outDetailView(node);
                    });

            });
        }

        function overDetailView(d) {
            active = true;
            draggedChannel = d3.select(".dragging");

        }

        function outDetailView(d) {
            active = false;

            if(draggedChannel[0][0]!=null) {
                var id = draggedChannel.attr("id");
                if (id.indexOf("qualityStripe") > -1) {
                    var channel = id.split("-")[1];
                    chart.addColumn(channel);
                    console.info("channel "+channel+" added");
                    draggedChannel = null;
                }
            }

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


        function loadChannel(url, callback){
            d3.json(url, function (error, json) {
                if (error) return console.warn(error);
                callback(json);
                layers.graph();
                layers.labels();
                layers.missingTimeStampMarker();
                layers.missingValues();
            })
        }

        // The x-accessor for the path generator; xScale ∘ xValue.
        function X(d) {
            return xScale(d.date);
        }

        // The x-accessor for the path generator; yScale ∘ yValue.
        function Y(d) {
            return yScale(+d.column);
        }

        // Return standard error with 95% confidence
        function se95(p, n) {
            return Math.sqrt(Math.abs(p*(1-p)/n)*1.96);
        };

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
            if(min>=0 && min<100 & max>0 && max<=100){
                var url = serverUrl
                            + "/get-data?column="+column
                            + "&from="+min
                            + "&to="+max
                            + "&granularity=auto&load=individually";
            }else{
                var url = serverUrl + "/get-data?column="+column+"&granularity=minute&load=individually";
            }

            loadChannel(url, function(json){
                updateChannels(json.columns[0]);
            })
        }

        chart.setRange = function (range){
            min = parseInt(range[0]);
            max = parseInt(range[1]);
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

            loadChannel(url, function(json){
                json.columns.forEach(function(element,index,array){
                   updateChannels(element);
                });
            });
         }

        chart.definedLine = function(_){
            if (!arguments.length) return indicators;
            indicators = _;
            return chart;
        }


        return chart;
    }

    return detailView;
});