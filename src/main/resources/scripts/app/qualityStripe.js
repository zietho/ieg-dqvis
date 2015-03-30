//function QualityBarView() {
define(['d3'], function (d3) {

    //create closure
    function qualityStripe() {
        //init + set defaults
        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom,
            g,
            columnName,
            xValue = function (d) {
                return d[0];
            },
            yValue = function (d) {
                return d[1];
            },
            layers = {},
            observer;

        /* onEvent Methods */
        function onEnterQualityTicks(data){
            var numberOfTicks = data[0].length;
            var tickWith = (width / numberOfTicks);

            this.append("rect")
                .attr("x", function (d, i) {
                    return i * tickWith ;
                })
                .attr("y", 0)
                .attr("width", function (d, i) {
                    return tickWith;
                })
                .attr("height", height)
                .attr("fill", function (d) {
                    var red = 199;
                    var green = ((1-d.quality)*red).toFixed(0);
                    var blue = 65+green;
                    return "rgb("+red+","+green+","+green+")";
                })
        }

        /* LAYERS */
        layers.border = function(){
            var border = g.append("rect")
                .classed("qualityViewBorder", true)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "white")

            return border;
        }

        layers.legend = function(){
            var legend = g.append("text")
                .classed("qualityViewLegendText", true)
                .text(columnName)
                .attr("x", 5)
                .attr("y",17);
        }

        layers.ticks = function(data){
            var ticks = g.append("g")
                .classed("qualityTicks", true)
                .selectAll("rect")
                .data(data)
                .enter()
                .call(onEnterQualityTicks) //call on Enter handler
        }

        layers.removeButton = function(){
            var removeButton = g.append("g")
                .attr("transform", "translate("+(width)+",10)")
                .classed("removeButton", true)
                .classed("visible", true)
                .on("click", function(){
                    observer.removeQualityStripe(g);
                   // observer.removeQualityStripe(d3.select(g));
                });

            /*Create the circle for each block */
            var circle = removeButton.append("circle")
                .attr("r", 14 )
                .attr("cy",2)
                .attr("fill", "grey")
                .classed("removeCircle", true);

            /* Create the text for each block */
            var text = removeButton.append("text")
                .attr("dx", -3)
                .attr("dy", 6)
                .text("X")
                .classed("removeText", true);
        }

        function chart(selection) {
            selection.each(function (data) {
                var existingChildren = d3.select(this).selectAll("g.qualityStripe")[0].length;
                g = d3.select(this).append("g")
                    .classed("qualityStripe", true)
                    .attr("width", width+50)
                    .attr("height", height)
                    .attr("transform", "translate(0,"+existingChildren*30+")")
                    .on("click", toggleRemoveButton);

                layers.border();
                layers.ticks(data);
                layers.legend();
            });
        }

        // The x-accessor for the path generator; xScale ∘ xValue.
        function X(d) {
            return xScale(d[0]);
        }

        // The x-accessor for the path generator; yScale ∘ yValue.
        function Y(d) {
            return yScale(d[1]);
        }

        function toggleRemoveButton(){
            var removeButton = g.select(".removeButton");
            if(removeButton.empty()) {
                if (columnName != "all") {
                    layers.removeButton();
                    g.select(".qualityViewBorder").classed("highlight", true);
                }
            }else{
                if(removeButton.classed("visible")){
                    removeButton.classed("visible", false);
                    removeButton.classed("invisible", true);
                   console.log(g.select(".border"));
                    g.select(".qualityViewBorder").classed("highlight", false);

                }else{
                    removeButton.classed("invisible", false);
                    removeButton.classed("visible", true);
                    g.select(".qualityViewBorder").classed("highlight", true);
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

        return chart;
    };

    return qualityStripe; //return and execute object within the closure
});