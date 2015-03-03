require(['d3','./app/qualityview', './app/detailview', './app/timeslider', './app/columnsview' ], function(d3,qv, dv,ts, cv) {

    var serverUrl = "http://localhost:8080";

    var qualityView = qv
        .x(function (d) {
            return new Date(+d.date);
        })
        .y(function (d) {
            return +d.quality;
        })
        .height(100)
        .margin({top: 0, right: 80, bottom: 30, left: 50});

    var detailView = dv
        .x(function (d) {
            return new Date(+d.date);
        })
        .y(function (d) {
            return +d.column;
        })
        .height(500)
        .width(800)
        .margin({top: 120, right: 0, bottom: 20, left: 50})
        .column("h");


    var timeSliderView = ts
        .width(dv.width)
        .timeSeriesView(dv)
        .sliderId("#slider");

    var columnsView = cv
        .height(500)
        .margin({top: 120, right: 80, bottom: 30, left: 50})
        .timeSeriesView(ts);


    //get data
    d3.json(serverUrl + "/get-data?granularity=minute", function (error, json) {
        if (error) return console.warn(error);
        var data = d3.select("#visualization")
            .datum(json.columns);
        data.call(detailView);
        d3.select("#visualization")
            .datum(json.columns[0].values)
            .call(qualityView);
        d3.select("#visualization")
            .datum(json.columns[0].values)
            .call(timeSliderView);
    });


    d3.json(serverUrl + "/get-available-columns", function (error, json) {
        if (error) return console.warn(error);
        var columns = d3.select("#columns")
            .datum(json)
        columns.call(columnsView);
    });


});