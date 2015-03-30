//function QualityBarView() {
define(['d3','jquery','./qualityStripe'], function (d3, jQuery,qs) {

    //create closure
    function qualityView(selection) {
        //init + set defaults
        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom,
            svg,
            g,
            serverUrl,
            layers={},
            qualityStripes=[],
            columns=[],
            tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0),
            qualityIndicator;

        layers.qualityStripes = function(){
            var qualityStripes = svg.append("g")
                .classed("qualityStripes", true)
                .attr("transform", "translate(35,0)");
            qualityStripes
                .append("g")
                .attr("id", "allQualityStripe");
            qualityStripes
                .append("g")
                .attr("id", "individualQualityStripes")
                .attr("transform", "translate(0,30)")
                .classed("invisible", true);

            return qualityStripes;
        }
        layers.individualQualityStripes = function(){

            return qualityStripes;
        }
        layers.qualityIndicator = function(){
            var select = d3.select(svg.node().parentNode)
                .append("select")
                .attr("id", "qualityIndicator");

            select
                .on("change", changeDataQualityIndicator);
            select
                .append("option")
                .attr("value", "all")
                .text("All");
            select
                .append("option")
                .attr("value", "mv")
                .text("Missing Values");
            select
                .append("option")
                .attr("value", "mt")
                .text("Missing Timestamps");
            select
                .append("option")
                .attr("value", "iv")
                .text("Invalid Values");

            return select;
        }
        layers.toggle = function(){
            var toggle = svg.append("polygon")
                    .classed("qualityStripeToggle", true)
                    .attr("fill", "grey")
                    .attr("stroke", "grey")
                    .attr("points", "00,00 10,20 20,00")
                    .on("click", toggleIndividualQualityStripes)
                    .on("mouseover", showToggleTooltip)
                    .on("mouseout", hideToggleTooltip);

            return toggle;
        }

        function chart(selection) {
            //add new svg
            svg = selection.append("svg");
            svg.attr("width", width)
                .attr("height", 600)
                .attr("id", "qualityView");

            //add layers
            layers.toggle();
            layers.qualityStripes();
            layers.qualityIndicator();
        }

        function toggleIndividualQualityStripes(){
            var toggle = d3.select(this);
            var iqs = d3.select("#individualQualityStripes");

            if(iqs.classed("visible")){
                iqs
                    .classed("visible", false)      //remove class if class was already active
                    .classed("invisible", true);    //add invisibility
                toggle
                    .transition()
                    .attr("points", "00,00 10,20 20,00");
            }else{
                iqs.classed("visible", true); //remove class if class was already active
                toggle
                    .transition()
                    .attr("points", "00,20 10,00 20,20");
            }
        }

        function showToggleTooltip(tooltipText){
            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9);
            tooltip
                .html("press to show individual channels")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }

        function hideToggleTooltip(){
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        }

        function changeDataQualityIndicator(){
            var currentValue = d3.event.target.value;
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
        }
        chart.addColumn = function(_){
            if (!arguments.length) return null;
            columns.push(_);
            return chart;
        }
        chart.serverUrl = function(_){
            if (!arguments.length) return serverUrl;
            serverUrl = _;
            return chart;
        }
        chart.bindTo = function(_){
            if (!arguments.length) return bindTo;
            bindTo = _;
            return chart;
        };
        chart.addQualityStripe = function(column){
            var newQualityStripe = qs()
            .height(25)
            .margin({top: 0, right: 0, bottom: 0, left: 0})
            .width(750)
            .observer(this)
            .columnName(column.name);

            d3.select((column.name == "all") ?
                    "#allQualityStripe" :
                    "#individualQualityStripes"
            )
            .datum(column.values)
            .call(newQualityStripe);
        }
        chart.removeQualityStripe = function(selection){
            var current = selection.node();
            var translate = false;

            d3.selectAll("g.qualityStripe").each(function(d,i) {
                if(!translate)
                    if(current == this)
                        translate = true;
                if (current != this && translate) {
                    var x = (30*(i-1))-30;
                    d3.select(this)
                        .transition()
                        .attr("transform", "translate(0,"+x+")");
                }
            });

            selection.transition().remove();
        };
        chart.qualityIndicator = function (_) {
            if (!arguments.length) return qualityIndicator;
            qualityIndicator = _;

        };
        return chart;
    };

    return qualityView; //return and execute object within the closure
});
