//function QualityBarView() {
define(['d3'], function (d3) {

    //create closure
    function qualityView(selection) {

        var layers = {};

        //init + set defaults
        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom,
            svg, g,columnName,
            xValue = function (d) {
                return d[0];
            },
            yValue = function (d) {
                return d[1];
            };

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
            var border = svg.append("rect")
                .classed("border", true)
                .attr("class", "qualityViewBorder")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "white");
            return border;
        }

        layers.legend = function(){
            var legend = svg.append("text")
                .classed("qualityViewLegend", true)
                .text(columnName)
                .attr("x", 10)
                .attr("y",50)
                .attr("class", "qualityViewLegendText");

        }

        layers.ticks = function(d){
            console.log(d);
            var ticks = svg.append("g")
                .classed("qualityTicks", true)
                .selectAll("rect")
                .data(d)
                .enter()
                .call(onEnterQualityTicks); //call on Enter handler
        }

        function chart(selection) {
            selection.each(function (data) {
                svg = d3.select(this).append("svg");
                svg.attr("width", width)
                    .attr("height", height);
                //@TODO fix border
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

        //set defaults like that
        //chord.width(options.width || 800);
        //chord.height(options.height || 500);
        //chord.setRadius();

        return chart;
    };

    return qualityView; //return and execute object within the closure
});
