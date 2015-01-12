require(['d3','./app/module1'], function(d3,qualityBarView){

    var serverUrl = "http://localhost:8080",
     column = "w";

    var q = qualityBarView
        .x(function(d) { return new Date(+d.date); })
        .y(function(d) { return +d.quality; })
        .height(100)
        .margin({top: 0,right: 80, bottom: 30, left: 50});

    //get data
    d3.json(serverUrl+"/get-data?column="+column, function(error, json) {
        if (error) return console.warn(error);


        d3.select("#visualization")
            .datum(json.columns[0].values)
            .call(q);






    })




});

//define(function (require) {

    //global vars
    /*var serverUrl = "http://localhost:8080",
     column = "w";*/

    // Load any app-specific modules
    // with a relative require call,
    // like:
    // var messages = require('./messages');

   // var timeSeriesView = require('./timeseriesview');
    //var timeSliderView = reuqire('./timesliderview');
    //var columnView = require('./columnsview');



    // Load library/vendor modules using
    // full IDs, like:
    //var print = require('print');
/*
    var d3 = require('d3');
    console.log(d3.version);
    var jQuery = require('jquery');
    var jQueryUI = require('jquery-ui.min');
    var jQuerySlider = require('jquery-draggableslider');

    console.log(jQuery);

    var $ = jQuery;

    console.log($('h1').text());
*/






    /*
        //global vars
        var serverUrl = "http://localhost:8080",
            column = "w";

        var qualityBarView = QualityBarView()
            .x(function(d) { return new Date(+d.date); })
            .y(function(d) { return +d.quality; })
            .height(100)
            .margin({top: 0,right: 80, bottom: 30, left: 50})

        var timeSeriesView = TimeSeriesView()
            .x(function(d) { return new Date(+d.date); })
            .y(function(d) { return +d.column; })
            .height(500)
            .width(800)
            .margin({top: 120,right: 0, bottom: 20, left: 50})
            .column(column);

        var timeSliderView = TimeSliderView()
            .width(timeSeriesView.width)
            .timeSeriesView(timeSeriesView)
            .sliderId("#slider");

        var columnsView = ColumnsView()
            .height(500)
            .margin({top:120, right:80, bottom:30, left:50})
            .timeSeriesView(timeSeriesView);

        //get data
        d3.json(serverUrl+"/get-data?column="+column, function(error, json) {
            if (error) return console.warn(error);
            var data = d3.select("#visualization")
                .datum(json.columns);
            data.call(timeSeriesView);

            d3.select("#visualization")
                .datum(json.columns[0].values)
                .call(qualityBarView);

            d3.select("#visualization")
                .datum(json.columns[0].values)
                .call(timeSliderView);




        })

        d3.json(serverUrl+"/get-available-columns", function(error, json) {
            if (error) return console.warn(error);

            var columns = d3.select("#columns")
                .datum(json)
            columns.call(columnsView);

        })

    */

//});