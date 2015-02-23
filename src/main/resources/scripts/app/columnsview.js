define(['d3'],function(d3) {

    var margin= {top: 20,right: 80, bottom: 30, left: 50},
        width =  960 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom,
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1];},
        timeSeriesView = undefined;

    function chart(selection) {
        selection.each(function(data) {
            //TODO - workaround - also make it available for multiple channels
            data = data.columns;
            console.log(data.columns);
            console.log("in")
            d3.select(this)
                .selectAll("li")
                .data(data, function(d){ return d.name})
                .enter()
                .append("li")
                .attr("class", "column")
                .text(function(d){ return d.name})
                .on("click", function(d){
                    timeSeriesView.addColumn(d);
                })
        });
    }

    chart.timeSeriesView = function(_){
        if (!arguments.length) return timeSeriesView;
        timeSeriesView = _;
        return chart;
    };

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    return chart;
});
