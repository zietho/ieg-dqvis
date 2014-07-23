function TimeSliderView() {
    var margin = {top: 550, right: 10, bottom: 20, left: 40},
        width =  960,
        height = 650,
        xValue = function(d) { return d[0];},
        yValue = function(d) { return d[1];},
        xScale = d3.time.scale(),
        yScale = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
        line = d3.svg.line().x(X).y(Y),
        brush = d3.svg.brush().x(xScale).on("brush", brushed),
        focus = undefined;

    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            //TODO - quick fix workaround make it available also for multiple channels
            data = data.data[0].column;

            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // Update the x-scale.
            xScale
                .domain(focus.xScale().domain())
                .range([0, width - margin.left - margin.right]);

            // Update the y-scale.
            yScale
                .domain(focus.yScale().domain())
                .range([height - margin.top - margin.bottom, 0]);

            var area  = d3.svg.area()
                .interpolate("monotone")
                .x(X)
                .y0(height)
                .y1(Y);

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height)

            var context = svg.append("g")
                .attr("class", "context")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            context.append("path")
                .attr("class", "area")
                .attr("d", area);

            context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            context.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", height + 7);

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

    function brushed() {
        console.log(brush.empty());

        console.log(focus);
        focus.xScale().domain(brush.empty() ? xScale.domain() : brush.extent());
        focus.g().select(".line").attr("d", focus.line);
        focus.g().select(".x.axis").call(focus.xAxis);
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

    chart.column = function(_){
        if (!arguments.length) return yValue;
        column = _;
        return chart;
    }

    chart.domain = function(_){
        if (!arguments.length) return yValue;
        xScale.domain(_);
        return chart;
    }
    chart.domain = function(_){
        if (!arguments.length) return yValue;
        yScale.domain(_);
        return chart;
    }

    chart.focus = function(_){
        console.log(_)
        console.log(_.height());
        if (!arguments.length) return focus;
        focus = _;
        return chart;
    }

    return chart;
}
