//function QualityBarView() {
define(['d3','colorbrewer'], function (d3, colorbrewer) {

    function qualityStripe() {
        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom,
            xValue = function (d) {
                return d[0];
            },
            yValue = function (d) {
                return d[1];
            },
            qualityStripe,
            qualityTicks,
            columnName,
            layers = {},
            observer,
            colorScale = d3.scale.ordinal()
                .domain([0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0])
                .range(colorbrewer.Reds[9]);


        // LAYERS
        layers.border = function(){
           var border = qualityStripe.append("rect")
                .classed("qualityViewBorder", true)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "white");
        }

        layers.legend = function(){
            var legend = qualityStripe.append("text")
                .classed("qualityViewLegendText", true)
                .text(columnName)
                .attr("x", 5)
                .attr("y",17);
        }

        layers.ticks = function(data){
            var ticks = qualityTicks
                .selectAll("rect")
                .data(data); //join new data

            var tickWidth = (width / data.length);

            //enter selection
            ticks
                .enter()
                .append("rect")
                .attr("x", function (d, i) {
                    return i * tickWidth ;
                })
                .attr("y", 0)
                .attr("width", function(d,i){
                    return tickWidth;
                })
                .attr("height", height)
                .classed("qualityTick", true)
                .on("mouseover", showTickDetails)
                .on("mouseout", hideTickDetails);

            //update selection
            ticks
                .attr("fill", function (d) {
                    var color = d3.rgb(colorScale(1-d.quality));
                    return "rgb("+color.r+","+color.g+","+color.b+")";
                });
            //exit selection
            ticks
                .exit()
                .remove();
        }

        layers.removeButton = function(){
            var removeButton = qualityStripe.append("g")
                .attr("transform", "translate("+(width)+",10)")
                .classed("removeButton", true)
                .classed("visible", true)
                .on("click", function(){
                    observer.removeQualityStripe(qualityStripe);
                });

            /*Create the circle for each block */
            var circle = removeButton.append("circle")
                .attr("r", 14 )
                .attr("cy",2)
                .attr("fill", "grey")
                .classed("removeCircle", true);

            /* Create the text for each block */
            var text = removeButton.append("text")
                .attr("dx", -5)
                .attr("dy", 8)
                .text("X")
                .classed("removeText", true);
        }

        // CONSTRUCTOR
        function chart(selection) {
            selection.each(function (data) {
                var existingChildren = d3.select(this).selectAll("g.qualityStripe")[0].length;

                //init quality stripe
                if(columnName==="all") {
                    qualityStripe = d3.select(this)
                        .insert("g",":last-child");
                }else{
                    qualityStripe = d3.select(this)
                        .append("g");
                }

                qualityStripe
                    .classed("qualityStripe", true)
                    .attr("width", width+50)
                    .attr("height", height)
                    .attr("transform", "translate(0,"+existingChildren*30+")")
                    .attr("id", "qualityStripe."+columnName)
                    .on("click", toggleRemoveButton);

                //draw border
                layers.border();

                //add ticks container
                qualityTicks = qualityStripe.append("g")
                    .classed("qualityTicks", true)

                //draw ticks
                layers.ticks(data);

                //draw legend channel legend
                layers.legend();
            });
        }

        // PRIVATE FUNCTIONS
        function toggleRemoveButton(){
            var removeButton = qualityStripe.select(".removeButton");
            if(removeButton.empty()) {
                if (columnName != "all") {
                    layers.removeButton();
                    qualityStripe.select(".qualityViewBorder").classed("highlight", true);
                }
            }else{
                if(removeButton.classed("visible")){
                    removeButton.classed("visible", false);
                    removeButton.classed("invisible", true);
                    qualityStripe.select(".qualityViewBorder").classed("highlight", false);

                }else{
                    removeButton.classed("invisible", false);
                    removeButton.classed("visible", true);
                    qualityStripe.select(".qualityViewBorder").classed("highlight", true);
                }
            }
        }

        function showTickDetails(){
            var tooltip = observer.getTooltip();
            var data = d3.select(this).data()[0];
            var date = new Date(data.date);
            var dateString = date.getDate()+"."+date.getMonth()+"."+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();

            //clear element first
            tooltip.html("");

            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

            tooltip
                .append("div")
                .text(dateString);


            if(columnName == "all"){
                //tick for all channels > C1, C2, with classes of css
                console.log("in");
                //just throu in all!
                var channels =  tooltip.append("ul")
                        .selectAll("li")
                        .data(data.affectedChannels)
                        .enter()
                        .append("li")
                        .style("color", function(d){
                            return getIndicatorColor(d.indicator);
                        })
                        .text(function(d){
                            return d.name;
                        })

            }else{



                //get seperation info from OBSERVER!!!!

                //channel a specific channel

                //with all quality indicators
                //display color coded I, M, Q with CSS classes

                //with a certain quality indicator
                //display NOTHINg
            }
        }

        function getIndicatorColor(indicator){
            var palette = observer.getColourPaletteOfIndicator(indicator);
            tmpColorScale = d3.scale.ordinal()
                .domain([0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0])
                .range(palette);
            var color = d3.rgb(tmpColorScale(0.5));
            return "rgb("+color.r+","+color.g+","+color.b+")";
        }

        function hideTickDetails(){
            observer.getTooltip()
                .transition()
                .duration(500)
                .style("opacity", 0);




        }
        // GETTERS & SETTERS

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

        chart.columnName = function (_) {
            if (!arguments.length) return columnName;
            columnName = _;
            return chart;
        };

        chart.observer = function (_) {
            if (!arguments.length) return observer;
            observer = _;
            return chart;
        };

        chart.redraw = function(data){
            layers.ticks(data);
            return chart;
        }

        chart.colorScale = function(_){
            if (!arguments.length) return colorScale;
            colorScale = _;
            return chart;
        }

        chart.colorPalette = function(_){
            if (!arguments.length) return colorScale.range;
            colorScale.range(_);
            return chart;
        }

        return chart;
    };

    return qualityStripe; //return and execute object within the closure
});