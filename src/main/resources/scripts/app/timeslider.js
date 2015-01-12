define(['d3','jquery','jquery-ui.min', 'jquery-draggableslider'],function(d3,$,jqui,jqds) {
    var width = 200,
        timeSeriesGraph = undefined,
        sliderId = undefined;

    function chart(selection) {
        selection.each(function(data) {

            if(sliderId) {
                var $slider =  $(sliderId);

                $slider.dragslider({
                    range: true,
                    min: 0,
                    max: data.length - 1,
                    values: [0, data.length - 1],
                    rangeDrag: true,
                    slide: function (event, ui) {

                        var maxv = d3.min([ui.values[1], data.length]);
                        var minv = d3.max([ui.values[0], 0]);

                        var maxDate = new Date(data[maxv].date);
                        var minDate = new Date(data[minv].date);

//                        var newData = data.slice(minv, maxv-1);

                        //this is the main part where the domain of x is readjusted
                        timeSeriesView.xScale()
                            .domain([minDate, maxDate])

                        //apply the change in x to the x-axis using a transition
                        timeSeriesView.g().transition().duration(750)
                            .select(".x.axis").call(timeSeriesView.xAxis());

                        //apply the change in x to the path (this would be your svg:path)
                        timeSeriesView.g().transition().duration(750)
                            .selectAll(".line").attr("d", timeSeriesView.lineWrapper());

                    }});

                   $slider.css("width",width);
            }

        });
    }

    chart.width = function(_){
        if (!arguments.length) return width;
        width = _;
        return chart;
    }

    chart.sliderId = function(_){
        if (!arguments.length) return sliderId;
        sliderId = _;
        return chart;
    }

    chart.timeSeriesView = function(_){
        if (!arguments.length) return timeSeriesView;
        timeSeriesView = _;
        return chart;
    }

    return chart;
});
