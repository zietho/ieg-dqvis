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
            yLeftScale = d3.scale.linear(), //set y-scale and range
            yRightScale = d3.scale.linear(),
            xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
            yAxisLeft = d3.svg.axis().scale(yLeftScale).orient("left"),
            yAxisRight = d3.svg.axis().scale(yRightScale).orient("right"),
            lineLeft = d3.svg.line().x(X).y(YLeft)
                .defined(definedLine),
            lineRight = d3.svg.line().x(X).y(YRight)
                .defined(definedLine),
            svg,
            g,
            layers = {},
            color = d3.scale.category10(),
            channels = [],
            serverUrl,
            active = false,
            draggedChannel,
            rangeMin,
            rangeMax,
            qualityIndicator = "$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp",
            missingTimeStamps,
            invalidValues,
            missingValues;

        /*  LAYERS  */

        layers.graph = function(){
            // update x and y scales (i.e, domain + range)
            xScale
                .domain(d3.extent(channels[0].values, xValue))
                .range([0,width]);

            console.info("number of channels: "+channels.length);

            //multiple mode
            if(channels.length>2) {
                var yMin = getMinimumValidValue(),
                    yMax = getMaximumValidValue();

                yLeftScale
                    .domain([
                        yMin - ((yMax - yMin) * 0.10),
                        yMax + ((yMax - yMin) * 0.10)
                    ])
                    .range([height, 0]);
            }else{ //dual mode
                var yLeftMin = getMinimumValidValueOfChannel(channels[0]),
                    yLeftMax = getMaximumValidValueOfChannel(channels[0]),
                    yRightMin = getMinimumValidValueOfChannel(channels[1]),
                    yRightMax = getMaximumValidValueOfChannel(channels[1]);

                yLeftScale
                    .domain([
                        yLeftMin - ((yLeftMax - yLeftMin) * 0.10),
                        yLeftMax + ((yLeftMax - yLeftMin) * 0.10)
                   ])
                    .range([height, 0]);
                yRightScale
                    .domain([
                        yRightMin - ((yRightMax - yRightMin) * 0.10),
                        yRightMax + ((yRightMax - yRightMin) * 0.10)
                    ])
                    .range([height, 0]);
            }

            //update axes
            d3.select(".x.axis").call(xAxis);
            d3.select("#yAxisLeft").call(yAxisLeft);
            if(channels.length==2) {
                d3.select("#yAxisRight").call(yAxisRight);
            }

            //update line path
            var paths = g.selectAll("path.line")
                .data(channels);

            if(channels.length>2) {

                //if dual remove
                if(!d3.select(".leftLine").empty() && !d3.select(".rightLine").empty()) {
                    d3.select(".leftLine").remove();
                    d3.select(".rightLine").remove();
                }
                //add new ones
                var pathsEnter = paths
                    .enter()
                    .append("path")
                    .classed("line", true)
                    .attr("id", function (d) {
                        return d.name;
                    })
                    //.transition()
                    .attr("d", function (d) {
                        return lineLeft(d.values);
                    })
                    .style("stroke", function (d) {
                        return color(d.name);
                    })
                    .style("stroke-width", 2)
                    .on("click", function (d) {
                        var selectedPath = d3.select(this);

                        //remove all old remove buttons and
                        d3.select("#detailViewCanvas").selectAll(".removeButton").remove();
                        d3.selectAll(".line").transition().style("stroke-width", 2)

                        if (selectedPath.style("stroke-width") === "2px") {
                            selectedPath.transition().style("stroke-width", 4);
                            addRemoveButton(selectedPath);
                        } else {
                            selectedPath.transition().style("stroke-width", 2);
                        }
                    })

                d3.transition().selectAll("path.line")
                    .attr("d", function (d) {
                        return lineLeft(d.values);
                    })

                paths.exit().remove();



            }else{

                if(d3.select(".leftLine").empty() && d3.select(".rightLine").empty()) {

                    console.info("create paths");

                    g.append("path")
                        .classed("leftLine", true)
                        .attr("id", channels[0].name)
                        //.transition()
                        .attr("d", lineLeft(channels[0].values))
                        .style("stroke", color(channels[0].name))
                        .style("stroke-width", 2)
                        .on("click", function (d) {
                            var selectedPath = d3.select(this);

                            //remove all old remove buttons and
                            d3.select("#detailViewCanvas").selectAll(".removeButton").remove();
                            d3.selectAll(".line").transition().style("stroke-width", 2)

                            if (selectedPath.style("stroke-width") === "2px") {
                                selectedPath.transition().style("stroke-width", 4);
                                addRemoveButton(selectedPath);
                            } else {
                                selectedPath.transition().style("stroke-width", 2);
                            }
                        })

                    g.append("path")
                        .classed("rightLine", true)
                        .attr("id", channels[1].name)
                        //.transition()
                        .attr("d", lineRight(channels[1].values))
                        .style("stroke", color(channels[1].name))
                        .style("stroke-width", 2)
                        .on("click", function (d) {
                            var selectedPath = d3.select(this);

                            //remove all old remove buttons and
                            d3.select("#detailViewCanvas").selectAll(".removeButton").remove();
                            d3.selectAll(".line").transition().style("stroke-width", 2)

                            if (selectedPath.style("stroke-width") === "2px") {
                                selectedPath.transition().style("stroke-width", 4);
                                addRemoveButton(selectedPath);
                            } else {
                                selectedPath.transition().style("stroke-width", 2);
                            }
                        })
                }else{
                    //update
                    d3.transition().select("path.leftLine")
                        .attr("d", lineLeft(channels[0].values));

                    d3.transition().select("path.rightLine")
                        .attr("d", lineRight(channels[1].values));
                }
            }
        }

        layers.labels = function(){
            var labels = g.selectAll("text.label")
                .data(channels)

            var labelsEnter = labels
                .enter()
                .append("text")
                .classed("label", true)
                .attr("transform", function(d){
                    return "translate(" + (width+3) + "," + YLeft(d.values[d.values.length-1]) + ")"
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
                    return "translate(" + (width+3) + "," + YLeft(d.values[d.values.length-1]) + ")"
                })

            labels.exit().remove();
        }

        layers.axes = function(){

            //x-axis
            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            //y-axis depending on the mode
                g.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yAxisLeft")
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Value");

                g.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yAxisRight")
                    .attr("transform", "translate(" + (width) + " ,0)") //shift
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Value");
        }

        /*
            Display data quality indicators in detail
         */

        layers.missingValues = function(){
            var missingDataValues,
                lineUpperBoundaryLeft,
                lineLowerBoundaryLeft,
                lineLowerBoundaryRight,
                lineUpperBoundaryRight;

            //remove dual componentes
            if(channels.length>2){
                //remove
                d3.select(".lowerBoundaryRight").remove();
                d3.select(".upperBoundaryRight").remove();
            }

            //deep clone object, because of pass by reference
            missingDataValues = filterDataQualityValues(channels, "$.MissingData");

            //calculate confidence values for each missing value
            channels.forEach(function(channel){
                var n = channel.values.length;
                channel.values.forEach(function(d){
                    d["confidence"] = se95(d.column,n);
                });
            });

            //define line functions for both the upper and lower confidence interval
            lineUpperBoundaryLeft = d3.svg.line()
                .defined(function(d){
                    var missing = false;
                    d.affectingIndicators.forEach(function (element, index, array) {
                        if (element == "$.MissingData" || element == "MissingTimeStamp") {
                            missing = true
                        }
                    })
                    return missing;
                })
                .x(function(d) { return X(d); })
                .y(function(d) {return yLeftScale(d.column + d.confidence); })

            lineLowerBoundaryLeft = d3.svg.line()
                .defined(function(d){
                    var missing = false;
                    d.affectingIndicators.forEach(function (element, index, array) {
                        if (element == "$.MissingData" || element == "MissingTimeStamp") {
                            missing = true;
                        }
                    })
                    return missing;
                })
                .x(function(d) { return X(d); })
                .y(function(d) { return yLeftScale(d.column - d.confidence); })


            lineUpperBoundaryRight = d3.svg.line()
                .defined(function(d){
                    var missing = false;
                    d.affectingIndicators.forEach(function (element, index, array) {
                        if (element == "$.MissingData" || element == "MissingTimeStamp") {
                            missing = true
                        }
                    })
                    return missing;
                })
                .x(function(d) { return X(d); })
                .y(function(d) {return yRightScale(d.column + d.confidence); })

            lineLowerBoundaryRight = d3.svg.line()
                .defined(function(d){
                    var missing = false;
                    d.affectingIndicators.forEach(function (element, index, array) {
                        if (element == "$.MissingData" || element == "MissingTimeStamp") {
                            missing = true;
                        }
                    })
                    return missing;
                })
                .x(function(d) { return X(d); })
                .y(function(d) { return yRightScale(d.column - d.confidence); })


            //display dots
            if(channels.length>2){
                console.log("in multiple dots");
                missingDataValues.forEach(function(channel, index, array) {
                    displayMissingDataDots(channel, YLeft);
                });
            }else{
                if(missingDataValues.length>=1) {
                    displayMissingDataDots(missingDataValues[0], YLeft);
                }
                if(missingDataValues.length==2) {
                    displayMissingDataDots(missingDataValues[1], YRight);
                }
            }

            //are two anyways alreay scaled so in both cases the same!
            var upperBoundaries = missingValues.selectAll("path.upperBoundary")
                .data(channels)

            var u = upperBoundaries
                .enter()
                .append("path")
                .style("stroke-dasharray", ("3, 3"))
                .classed("upperBoundary", true)
                .attr("d", function(d,i) {
                    if (channels.length == 2 && i == 1) {
                        return lineUpperBoundaryRight(d.values);
                    }else{
                        return lineUpperBoundaryLeft(d.values);
                    }
                })
                .style("stroke", function (d) {
                    return color(d.name);
                })
                .style("stroke-width", 2)

            if(channels.length==2){
                u.classed("upperBoundaryRight",true);
            }

            var lowerBoundaries = missingValues.selectAll("path.lowerBoundary")
                .data(channels)

            var l = lowerBoundaries
                .enter()
                .append("path")
                .style("stroke-dasharray", ("3, 3")) // dashed confidence intervalls
                .classed("lowerBoundary", true)
                .attr("d", function(d, i){
                    if (channels.length == 2 && i == 1) {
                        return lineLowerBoundaryRight(d.values);
                    }else{
                        return lineLowerBoundaryLeft(d.values);
                    }
                })
                .style("stroke", function (d) {
                    return color(d.name);
                })
                .style("stroke-width", 2)

            if(channels.length==2){
                l.classed("lowerBoundaryRight",true);
            }

            //on transition move paths
            d3.transition().selectAll("path.upperBoundary")
                .attr("d", function (d,i) {
                    console.info("in move!")
                    if (channels.length == 2 && i == 1) {
                        return lineUpperBoundaryRight(d.values);
                    }else{
                        return lineUpperBoundaryLeft(d.values);
                    }
                })

            d3.transition().selectAll("path.lowerBoundary")
                .attr("d", function (d,i) {
                    if (channels.length == 2 && i == 1) {
                        return lineLowerBoundaryRight(d.values);
                    }else{
                        return lineLowerBoundaryLeft(d.values);
                    }
                })

            //on exit selection - remove paths
            lowerBoundaries.exit().remove();
            upperBoundaries.exit().remove();
        }

        layers.invalidValues = function(){
            //1. retrieve all invalid values for later display.
            var invalidValuesData = filterDataQualityValues(channels, "$.InvalidData");

            //2. retrieve all valid values in order to calculate the local minium and maximum for each channel.
            var validValues = JSON.parse(JSON.stringify(channels)).filter(function(d) {
                d.values = d.values.filter(function (value) {
                    //only return the value if the array with affecting Indicators is either undefined or empty.
                    if (typeof value.affectingIndicators === 'undefined' || value.affectingIndicators.length === 0){
                        return value
                    }
                });

                //calculate the local minimum and maximum value for all valid values of the the respective channel
                //note: only available within the valid values
                d.max =  d3.max(d.values, yValue)
                d.min = d3.min(d.values, yValue)

                if(d.values.length>0)
                    return d;
            });




            //update line path
            invalidValuesData.forEach(function(channel, index, array) {
                //for each channel retrieve the calculated local minimum rangeMin and rangeMax.
                var channelMax, channelMin;

                //because the local rangeMin and rangeMax is only available for the valid data, it is saved there
                validValues.forEach(function(c, index, array){
                    if(channel.name==c.name){
                        channelMax = c.max;
                        channelMin = c.min;
                    }
                });


                //draw invaliv values
                var invalidDataRect = invalidValues.selectAll("rect.invalidValueRect-"+channel.name)
                    .data(channel.values);

                //add new ones
                invalidDataRect
                    .enter()
                    .append("rect")
                    .classed("invalidValueRect-"+channel.name, true)
                    .attr("x", function (d) {
                        return X(d);
                    })
                    .attr("y", function (d) {
                        var distanceToMax = Math.abs(channelMax - YLeft(d));
                        var distanceToMin = Math.abs(channelMin - YLeft(d));

                        if(distanceToMax<=distanceToMin){
                            if(array.length==2 && index==1 || array.length==1 && channel.name == channels[1].name){
                                return yRightScale(channelMax);
                            }else{
                                return yLeftScale(channelMan);
                            }
                        }else{
                            if(array.length==2 && index==1 || array.length==1 && channel.name == channels[1].name){
                                console.log("right scaled");
                                return yRightScale(channelMin)
                            }else{
                                return yLeftScale(channelMin);
                            }
                        }

                    })
                    .attr("width", 3)
                    .attr("height",3)
                    .style("fill", function (d) {
                        return color(channel.name);
                        return "black";
                    })

                d3.transition().selectAll("rect.invalidValueRect-"+channel.name)
                    .attr("x", function (d) {
                        return X(d);
                    })
                    .attr("y", function (d) {
                        var distanceToMax = Math.abs(channelMax - YLeft(d));
                        var distanceToMin = Math.abs(channelMin - YLeft(d));


                        if(distanceToMax<=distanceToMin){
                            return yLeftScale(channelMax);
                        }else{
                            return yLeftScale(channelMin);
                        }
                    })

                invalidDataRect.exit().remove();

            });



        }

        layers.missingTimeStampMarker = function(){

            //only get first channel! because we only need to do this once, as a missing time stamp spans over all channels
            var channel = channels[0];

            var mtMarker = missingTimeStamps
                .selectAll(".mtMarker")
                .data(channel.values.filter(function(d){
                    if(d.affectingIndicators.indexOf("MissingTimeStamp")>-1)
                        return d
                }))

            mtMarker
                .enter()
                .append("text")
                .classed("mtMarker", true)
                .attr("x", function(d){
                    return X(d);
                })
                .attr("y", height+5)
                .style("fill","red")
                .style("stroke-width",10)
                .text("X");

            d3.transition().selectAll(".mtMarker")
                .attr("x", function(d){
                    return X(d);
                })

            mtMarker.exit().remove();
        }

        /*
            Helper functions
         */

        function displayMissingDataDots(channel, scaleFunction){
            console.log(channel);
            var missingDataDots = missingValues.selectAll("circle.missingDataDot-"+channel.name)
                .data(channel.values);

            //add new ones
            missingDataDots
                .enter()
                .append("circle")
                .classed("missingDataDot-"+channel.name, true)
                .attr("cx", function (d) {
                    return X(d);
                })
                .attr("cy", function (d) {
                    return scaleFunction(d)
                })
                .attr("r", 2)
                .style("stroke", function (d) {
                    return color(channel.name);
                })

            d3.transition().selectAll("circle.missingDataDot-"+channel.name)
                .attr("cx", function (d) {
                    return X(d);
                })
                .attr("cy", function (d) {
                    return scaleFunction(d)
                })

            missingDataDots.exit().remove();
        }

        function definedLine(d){
            var definded = true;
            d.affectingIndicators.forEach(function (element, index, array) {
                if (element == "$.MissingData" || element == "MissingTimeStamp" || element == "$.InvalidData") {
                    definded = false;
                }
            })
            return definded;
        }

        function getMinimumValidValue(){
            return d3.min(channels, function (channel) {
                return getMinimumValidValueOfChannel(channel);
            })
        }

        function getMinimumValidValueOfChannel(channel){
            //for scaling only consider valid values!
            var values = channel.values.filter(function (value) {
                if (typeof value.affectingIndicators === 'undefined' || value.affectingIndicators.length === 0){
                    return value;
                }
            })

            return d3.min(values, yValue);
        }

        function getMaximumValidValue(){
            return d3.max(channels, function (channel) {
                return getMaximumValidValueOfChannel(channel);
            })
        }

        function getMaximumValidValueOfChannel(channel){
            //for scaling only consider valid values!
            var values =  channel.values.filter(function (value) {
                if (typeof value.affectingIndicators === 'undefined' || value.affectingIndicators.length === 0){
                    //value.column = value.column+value.confidence;
                    return value;
                }
            });

            return d3.max(values, yValue)
        }

        function removeChannel(selectedPath){
            var id = selectedPath.attr("id");
            channels.forEach(function(column,index,array){
                if(column.name==id) {
                    channels.splice(index,1);
                    selectedPath.remove();
                }
            });

            //d3.selectAll(".label").each(function(d,i){
            //    if(d.name==id){
            //        this.remove();
            //    }
            //})

            layers.graph();
            layers.labels();
        }

        function addRemoveButton(selectedPath){
            var data = selectedPath.data()[0];
            var y = YLeft(data.values[data.values.length-1]);

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

                //add containers for data quality problems in detail
                missingTimeStamps = g
                    .append("g")
                    .attr("id", "MissingTimeStamp")
                    .classed("dataQualityIndicatorDetail",true)
                    //.attr("layerFunction",layers.missingTimeStampMarker);

                missingValues = g
                    .append("g")
                    .attr("id", "$.MissingData")
                    .classed("dataQualityIndicatorDetail",true)
                    //.attr("layerFunction", layers.missingValues);

                invalidValues = g
                    .append("g")
                    .attr("id", "$.InvalidData")
                    .classed("dataQualityIndicatorDetail",true)
                    //.attr("layerFunction", layers.invalidValues);

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

        function displayQualityIndicators(id){
            switch(id){
                case "$.InvalidData":
                    layers.invalidValues();
                    break;
                case "$.MissingData":
                    layers.missingValues();
                    break;
                case "MissingTimeStamp":
                    layers.missingTimeStampMarker();
                    break;
                case "$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp":
                    layers.invalidValues();
                    layers.missingValues();
                    layers.missingTimeStampMarker()
                    break;

            }
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
                    //calc rangeMax and rangeMin
                    contained = true;
                }
            });

            if(!contained){
                channels.push(data);
            }


            //remove dual axis if more than 2 channels
            if(channels.length>2) {
                d3.select("#yAxisRight").attr("visibility","hidden");
            }else{
                d3.select("#yAxisRight").attr("visibility","visible");

            }

        }

        function loadChannel(url, callback){
            d3.json(url, function (error, json) {
                if (error) return console.warn(error);
                callback(json);
                layers.graph();
                layers.labels();

                displayQualityIndicators(qualityIndicator);
            })
        }

        // The x-accessor for the path generator; xScale ∘ xValue.
        function X(d) {
            return xScale(d.date);
        }

        // The x-accessor for the path generator; yScale ∘ yValue.
        function YLeft(d) {
            return yLeftScale(+d.column);
        }

        // The x-accessor for the path generator; yScale ∘ yValue.
        function YRight(d) {
            return yRightScale(+d.column);
        }

        // Return standard error with 95% confidence
        function se95(p, n) {
            return Math.sqrt(Math.abs(p*(1-p)/n)*1.96);
        };

        function filterDataQualityValues(channel, qualityProblem ){
            //deep clone object, because of pass by reference
            return JSON.parse(JSON.stringify(channels)).filter(function(d) {
                d.values = d.values.filter(function (value) {
                    if (value.affectingIndicators.indexOf(qualityProblem) > -1){
                        return value
                    }
                });

                if(d.values.length>0)
                    return d;
            });
        }

        /*
            Setter and Getter
         */

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
            if(rangeMin>=0 && rangeMin<100 & rangeMax>0 && rangeMax<=100){
                var url = serverUrl
                    + "/get-data?column="+column
                    + "&from="+rangeMin
                    + "&to="+rangeMax
                    + "&granularity=auto&load=individually";
            }else{
                var url = serverUrl + "/get-data?column="+column+"&granularity=minute&load=individually";
            }

            loadChannel(url, function(json){
                updateChannels(json.columns[0]);
            })
        }

        chart.setRange = function (range){
            rangeMin = parseInt(range[0]);
            rangeMax = parseInt(range[1]);
            var url = serverUrl + "/get-data?"; //start building the URL

            //Channels/Columns
            channels.forEach(function(element,index,array){
                url+= "column="+element.name+"&";
            });

            //From - To
            if(rangeMin>=0 && rangeMin < rangeMax) {
                url += "from="+rangeMin;
            }
            if(rangeMin<rangeMax && rangeMax<=100){
                url += "&to="+rangeMax;
            }

            url += "&granularity=auto&load=individually";

            loadChannel(url, function(json){
                json.columns.forEach(function(element,index,array){
                    updateChannels(element);
                });
            });
        }

        chart.setQualityIndicator = function(_){
                qualityIndicator = _;
                //remove all unecessary layers here!
                if (qualityIndicator=="$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp") {
                    displayQualityIndicators(_);
                } else {
                    //remove all except for the choosen one!
                    d3.selectAll(".dataQualityIndicatorDetail").each(function(qualityIndicatorDetailLayer){
                        var element =  d3.select(this);
                        if(element.attr("id")!=qualityIndicator){
                            //clean layer
                            element.selectAll("*").remove();
                        }else{
                            console.log("display!"+element.attr("id"));
                            if(element.selectAll("*").empty){ //if layer has been removed before - read it
                                displayQualityIndicators(element.attr("id"));
                            }
                        }
                    });
                }
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