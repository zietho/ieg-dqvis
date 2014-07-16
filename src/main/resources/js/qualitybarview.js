function QualityBarView() {
    var margin= {top: 20,right: 80, bottom: 30, left: 50},
        width =  960 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom,
        xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; };

    function chart(selection) {
        selection.each(function(data) {
            var rawData = data
            console.log(rawData)
            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg")
            var g = svg.append("g")
            var dqbar = svg.append("rect")
             .attr("class", "line")
             .attr("x", 0)
             .attr("y", 0)
             .attr("width", width)
             .attr("height",100);

             g.selectAll("rect")
             .data(rawData)
             .enter()
             .append("rect")
             .attr("x", function(d,i){
                return i * (width / data.length);
             })
             .attr("y", 0)
             .attr("width", function(d,i){
             return width/data.length;
             })
             .attr("height",100)
             .attr("fill", function(d){
             console.log(d.quality)
             return "rgb(0, 0, " + (d.quality * 100) + ")";
             })

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

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    return chart;
}
