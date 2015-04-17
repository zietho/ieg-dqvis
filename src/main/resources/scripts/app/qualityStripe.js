//function QualityBarView() {
define(['d3'], function (d3) {

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
            observer;

        /* LAYERS */
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
                .classed("qualityTick", true);

            //update selection
            ticks
                .attr("fill", function (d) {
                    var r = 199;
                    var g = ((1-d.quality)*r).toFixed(0);
                    var b = g;
                    return "rgb("+r+","+g+","+b+")";
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
                   console.log(qualityStripe.select(".border"));
                    qualityStripe.select(".qualityViewBorder").classed("highlight", false);

                }else{
                    removeButton.classed("invisible", false);
                    removeButton.classed("visible", true);
                    qualityStripe.select(".qualityViewBorder").classed("highlight", true);
                }
            }
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

        return chart;
    };

    return qualityStripe; //return and execute object within the closure
});