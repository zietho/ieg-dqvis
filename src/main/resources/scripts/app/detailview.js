//function QualityBarView() {
define(['d3'], function (d3) {

    function detailView() {
        //initialize variables
        var margin = {top: 20, right: 80, bottom: 80, left: 50},
            id,
            prefix,
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
            lineUpperBoundaryLeft = d3.svg.line()
                .defined(definedFunctionForMissingValues)
                .x(function(d) { return X(d); })
                .y(function(d) {return yLeftScale(d.column + d.confidence); }),
            lineLowerBoundaryLeft = d3.svg.line()
                .defined(definedFunctionForMissingValues)
                .x(function(d) { return X(d); })
                .y(function(d) { return yLeftScale(d.column - d.confidence); }),
            lineUpperBoundaryRight = d3.svg.line()
                .defined(definedFunctionForMissingValues)
                .x(function(d) { return X(d); })
                .y(function(d) {return yRightScale(d.column + d.confidence); }),
            lineLowerBoundaryRight = d3.svg.line()
                .defined(definedFunctionForMissingValues)
                .x(function(d) { return X(d); })
                .y(function(d) { return yRightScale(d.column - d.confidence); }),
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
            gMissingTimeStamps,
            gInvalidValues,
            gMissingValues;


        /*  LAYERS  */
        layers.graph = function(){
            // update x and y scales (i.e, domain + range)
            xScale
                .domain(d3.extent(channels[0].values, xValue))
                .range([0,width]);

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
                    yRightMin = (channels.length==2) ? getMinimumValidValueOfChannel(channels[1]) : null,
                    yRightMax = (channels.length==2) ? getMaximumValidValueOfChannel(channels[1]) : null;

                yLeftScale
                    .domain([
                        yLeftMin - ((yLeftMax - yLeftMin) * 0.10),
                        yLeftMax + ((yLeftMax - yLeftMin) * 0.10)
                   ])
                    .range([height, 0]);

                if(channels.length==2) {
                    yRightScale
                        .domain([
                            yRightMin - ((yRightMax - yRightMin) * 0.10),
                            yRightMax + ((yRightMax - yRightMin) * 0.10)
                        ])
                        .range([height, 0]);
                }
            }

            //update axes
            d3.select("#"+prefix+"xAxis").call(xAxis);
            d3.select("#"+prefix+"yAxisLeft").call(yAxisLeft);
            if(channels.length==2) {
                d3.select("#"+prefix+"yAxisRight").call(yAxisRight);
            }

            //update line path
            var paths = g.selectAll("path."+prefix+"line")
                .data(channels);

            if(channels.length>2) {

                //if dual remove
                if(!d3.select("."+prefix+"leftLine").empty() && !d3.select(".rightLine").empty()) {
                    d3.select("."+prefix+"leftLine").remove();
                    d3.select("."+prefix+"rightLine").remove();
                }
                //add new ones
                var pathsEnter = paths
                    .enter()
                    .append("path")
                    .classed(prefix+"line", true)
                    .attr("id", function (d) {
                        return d.name;
                    })
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
                        d3.select("#"+prefix+"canvas").selectAll(".removeButton").remove();
                        d3.selectAll("."+prefix+"line").transition().style("stroke-width", 2)

                        if (selectedPath.style("stroke-width") === "2px") {
                            selectedPath.transition().style("stroke-width", 4);
                            addRemoveButton(selectedPath);
                        } else {
                            selectedPath.transition().style("stroke-width", 2);
                        }
                    })

                d3.transition().selectAll("path."+prefix+"line")
                    .attr("d", function (d) {
                        return lineLeft(d.values);
                    })

                paths.exit().remove();
            }else{
                if(d3.select("."+prefix+"leftLine").empty() && d3.select("."+prefix+"rightLine").empty()) {
                    g.append("path")
                        .classed(prefix+"leftLine", true)
                        .attr("id", channels[0].name)
                        //.transition()
                        .attr("d", lineLeft(channels[0].values))
                        .style("stroke", color(channels[0].name))
                        .style("stroke-width", 2)
                        .on("click", function (d) {
                            var selectedPath = d3.select(this);

                            //remove all old remove buttons and
                            d3.select("#"+prefix+"canvas").selectAll("."+prefix+"removeButton").remove();
                            d3.selectAll("."+prefix+"line").transition().style("stroke-width", 2)

                            if (selectedPath.style("stroke-width") === "2px") {
                                selectedPath.transition().style("stroke-width", 4);
                                addRemoveButton(selectedPath);
                            } else {
                                selectedPath.transition().style("stroke-width", 2);
                            }
                        })

                    if(channels.length==2) {
                        g.append("path")
                            .classed(prefix + "rightLine", true)
                            .attr("id", channels[1].name)
                            //.transition()
                            .attr("d", lineRight(channels[1].values))
                            .style("stroke", color(channels[1].name))
                            .style("stroke-width", 2)
                            .on("click", function (d) {
                                var selectedPath = d3.select(this);

                                //remove all old remove buttons and
                                d3.select("#" + prefix + "canvas").selectAll("." + prefix + "removeButton").remove();
                                d3.selectAll(".line").transition().style("stroke-width", 2)

                                if (selectedPath.style("stroke-width") === "2px") {
                                    selectedPath.transition().style("stroke-width", 4);
                                    addRemoveButton(selectedPath);
                                } else {
                                    selectedPath.transition().style("stroke-width", 2);
                                }
                            })
                    }
                }
                else{
                    //update
                    d3.transition().select("path."+prefix+"leftLine")
                        .attr("d", lineLeft(channels[0].values));

                    if(channels.length==2) {
                        d3.transition().select("path." + prefix + "rightLine")
                            .attr("d", lineRight(channels[1].values));
                    }
                }
            }
        }

        layers.labels = function(){
            var labels = g.selectAll("text."+prefix+"label")
                .data(channels)

            var labelsEnter = labels
                .enter()
                .append("text")
                .classed(prefix+"label", true)
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

            d3.transition().selectAll("text."+prefix+"label")
                .attr("transform", function(d){
                    return "translate(" + (width+3) + "," + YLeft(d.values[d.values.length-1]) + ")"
                })

            labels.exit().remove();
        }

        layers.axes = function(){
            //x-axis
            g.append("g")
                .attr("class", "x axis")
                .attr("id", prefix+"xAxis")
                .attr("transform", "translate(0," + height + ")");

            //y-axis depending on the mode
                g.append("g")
                    .attr("class", "y axis")
                    .attr("id", prefix+"yAxisLeft")
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Value");

                g.append("g")
                    .attr("class", "y axis")
                    .attr("id", prefix+"yAxisRight")
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
            //calculate confidence values for each missing value
            channels.forEach(function(channel){
                var n = channel.values.length;
                channel.values.forEach(function(d){
                    d["confidence"] = se95(d.column,n);
                });
            });

            channels.forEach(function (channel, index, array) {
                //display missing values dots
                var missingDataValues = filterDataQualityValues(channel, "$.MissingData");

                var missingDataDots = gMissingValues.selectAll("circle.missingDataDot-"+channel.name)
                    .data(missingDataValues);

                //add new ones
                missingDataDots
                    .enter()
                    .append("circle")
                    .classed(prefix+"missingDataDot-"+channel.name, true)
                    .attr("cx", function (d) {
                        return X(d);
                    })
                    .attr("cy", scaleMissingDataValues)
                    .attr("r", 2)
                    .style("stroke", function (d) {
                        return color(channel.name);
                    })

                d3.transition().selectAll("circle."+prefix+"missingDataDot-"+channel.name)
                    .attr("cx", function (d) {
                        return X(d);
                    })
                    .attr("cy", scaleMissingDataValues);

                missingDataDots.exit().remove();
            })

            //DISPLAY BOUNDARIES

            //UPPER
            var upperBoundaries = gMissingValues.selectAll("path."+prefix+"upperBoundary")
                .data(channels)

            var u = upperBoundaries
                .enter()
                .append("path")
                .style("stroke-dasharray", ("3, 3"))
                .classed(prefix+"upperBoundary", true)
                .attr("d", function(d,i) {
                    return scaleMissingDataUpperBoundary(d.values, i);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                })
                .style("stroke-width", 2)

            d3.transition().selectAll("path."+prefix+"upperBoundary")
                .attr("d", function (d,i) {
                    return scaleMissingDataUpperBoundary(d.values, i);
                })

            upperBoundaries.exit().remove();

            //LOWER
            var lowerBoundaries = gMissingValues.selectAll("path."+prefix+"lowerBoundary")
                .data(channels)

            var l = lowerBoundaries
                .enter()
                .append("path")
                .style("stroke-dasharray", ("3, 3")) // dashed confidence intervalls
                .classed(prefix+"lowerBoundary", true)
                .attr("d", function(d, i){
                    return scaleMissingDataLowerBoundary(d.values, i);
                })
                .style("stroke", function (d) {
                    return color(d.name);
                })
                .style("stroke-width", 2)

            //on transition move paths
            d3.transition().selectAll("path."+prefix+"lowerBoundary")
                .attr("d", function (d,i) {
                    return scaleMissingDataLowerBoundary(d.values, i);
                })

            //on exit selection - remove paths
            lowerBoundaries.exit().remove();

        }

        layers.invalidValues = function() {
            var invalidDataRect;

            //remove old ones
            gInvalidValues.selectAll("*").remove();

            channels.forEach(function (channel, index, array){
                //calculate local max and minimum
                var validValues = channel.values.filter(function (value) {
                    //only return the value if the array with affecting Indicators is either undefined or empty.
                    if (typeof value.affectingIndicators === 'undefined' || value.affectingIndicators.length === 0) {
                        return value
                    }
                });

                //calculate the local minimum and maximum value for all valid values of the the respective channel
                //note: only available within the valid values
                channel.max = d3.max(validValues, yValue)
                channel.min = d3.min(validValues, yValue)

                var invalidDataValues = filterDataQualityValues(channel, "$.InvalidData");

                //draw invaliv values
                invalidDataRect = gInvalidValues.selectAll("rect."+prefix+"invalidValueRect-" + channel.name)
                    .data(invalidDataValues);

                //add new ones
                invalidDataRect
                    .enter()
                    .append("rect")

                    .classed(prefix+"invalidValueRect-" + channel.name, true)
                    .attr("x", function (d) {
                        return X(d);
                    })
                    .attr("y", function (d) {
                        return scaleInvalidDataValue(channel, index, d);
                    })
                    .attr("width", 3)
                    .attr("height", 3)
                    .style("fill", function (d) {
                        return color(channel.name);
                        return "black";
                    })

                //transition
                d3.transition().selectAll("rect."+prefix+"invalidValueRect-" + channel.name)
                    .attr("x", function (d) {
                        return X(d);
                    })
                    .attr("y", function (d) {
                        return scaleInvalidDataValue(channel, index, d);
                    })

                //remove old ones
                invalidDataRect.exit().remove();
            });


        }

        layers.missingTimeStampMarker = function(){

            //only get first channel! because we only need to do this once, as a missing time stamp spans over all channels
            var channel = channels[0];

            var mtMarker = gMissingTimeStamps
                .selectAll("."+prefix+"missingTimeStamp")
                .data(channel.values.filter(function(d){
                    if(d.affectingIndicators.indexOf("MissingTimeStamp")>-1)
                        return d
                }))

            mtMarker
                .enter()
                .append("text")
                .classed(prefix+"missingTimeStamp", true)
                .attr("x", function(d){
                    return X(d);
                })
                .attr("y", height+5)
                .style("fill","red")
                .style("stroke-width",10)
                .text("X");

            d3.transition().selectAll("."+prefix+"missingTimeStamp")
                .attr("x", function(d){
                    return X(d);
                })

            mtMarker.exit().remove();
        }

        /*
            UTILITY/HELPER FUNCTIONs
         */

        function chart(selection) {
            selection.each(function (data) {
                //first update Channels
                updateChannels(data);

                // Select the svg element, if it exists.
                svg = d3.select(this)
                    .append("svg")
                    .attr("id", "detailView-"+id)
                    .attr("width", width+margin.right)
                    .attr("height", height+margin.bottom);

                //update inner dimensions
                g = svg
                    .append("g")
                    .attr("id",prefix+"canvas")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                //add containers for data quality problems in detail
                gMissingTimeStamps = g
                    .append("g")
                    .attr("id", "MissingTimeStamp")
                    .classed(prefix+"dataQualityIndicatorDetail",true)

                gMissingValues = g
                    .append("g")
                    .attr("id", "$.MissingData")
                    .classed(prefix+"dataQualityIndicatorDetail",true)

                gInvalidValues = g
                    .append("g")
                    .attr("id", "$.InvalidData")
                    .classed(prefix+"dataQualityIndicatorDetail",true)

                //axes
                layers.axes();

                displayQualityIndicators(qualityIndicator)

                svg
                    .on("mouseover", overDetailView)
                    .on("mouseup", outDetailView);
            });
        }

        function definedFunctionForMissingValues(d){
            var missing = false;
            d.affectingIndicators.forEach(function (element, index, array) {
                if (element == "$.MissingData" || element == "MissingTimeStamp") {
                    missing = true;
                }
            })
            return missing;
        }

        function scaleMissingDataUpperBoundary(value, index){
            return (index==0 || index>=2) ? lineUpperBoundaryLeft(value) : lineUpperBoundaryRight(value);
        }

        function scaleMissingDataLowerBoundary(value, index){
            return (index==0 || index>=2) ? lineLowerBoundaryLeft(value) : lineLowerBoundaryRight(value);
        }

        function scaleMissingDataValues(value, index){
            return (index==0 || index>=2) ? YLeft(value) : YRight (value);
        }

        function scaleInvalidDataValue(channel, index, value){
            //first decide which scaleFunction
            var distanceToMin = (index==0 || index>=2) ? Math.abs(channel.max - YLeft(value)) : Math.abs(channel.max - YRight(value));
            var distanceToMax = (index==0 || index>=2) ? Math.abs(channel.min - YLeft(value)) : Math.abs(channel.min - YRight(value));

            if(distanceToMax<=distanceToMin){
                return (index==0 || index>=2) ? yLeftScale(channel.max) : yRightScale(channel.max);
            }else{
                return (index==0 || index>=2) ? yLeftScale(channel.min) : yRightScale(channel.min);
            }
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

            var removeButton =  d3.select("#"+prefix+"canvas")
                .append("g")
                .classed(prefix+"removeButton", true)
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
                .classed(prefix+"removeCircle", true);


            /* Create the text for each block */
            var text = removeButton.append("text")
                .attr("dx", -5)
                .attr("dy", 8)
                .text("X")
                .classed(prefix+"removeText", true);
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

            //go through all channels and check whether the channel is already locally available
            for(var i=0; i<channels.length;i++){
                if(channels[i].name==data.name){
                    channels[i].values = data.values;
                    contained = true;
                    break;
                }
            }

            if(!contained){
                channels.push(data);
            }

            //remove dual axis if more than 2 channels exist
            if(channels.length>2) {
                d3.select("#"+prefix+"yAxisRight").attr("visibility","hidden");
            }else{
                d3.select("#"+prefix+"yAxisRight").attr("visibility","visible");

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

        /*
            ACCESSOR FUNCTIONs
         */

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
            return channel.values.filter(function(d){
                if (typeof d.affectingIndicators !== 'undefined' || d.affectingIndicators.length > 0){
                    if (d.affectingIndicators.indexOf(qualityProblem) > -1) {
                        return d;
                    }
                }
            })
        }

        /*
            SETTER and GETTER
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
                    d3.selectAll("."+prefix+"dataQualityIndicatorDetail").each(function(qualityIndicatorDetailLayer){
                        var element =  d3.select(this);
                        if(element.attr("id")!=qualityIndicator){
                            //clean layer
                            element.selectAll("*").remove();
                        }else{
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

        chart.id = function(_){
            if (!arguments.length) return id;
            id = _;
            prefix = "detailView-"+id+"-";
            return chart;
        }

        return chart;
    }

    return detailView;
});