require(['d3','d3.chart','./app/qualityview', './app/detailview', './app/timeslider', './app/columnsview' ], function(d3, _$, qv, dv,ts, cv) {


    var serverUrl = "http://localhost:8080";



    var qualityView = d3.select("#visualization")
        .append('svg')
        .chart('BarChart')
        .height(400)
        .width(800);

    //get data
    d3.json(serverUrl + "/get-data?granularity=minute", function (error, json) {
        if (error) return console.warn(error);
        var data = d3.select("#visualization")
            .datum(json.columns);
        qualityView.draw(data);

    });
});