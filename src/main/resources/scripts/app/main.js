require(['d3','./app/qualityview' ], function(d3,qv) {
    var serverUrl = "http://localhost:8080";
    var qualityViews =[];

    //Quality Stripe of all data quality problems
    var qualityView = qv()
        .x(function (d) {
            return new Date(+d.date);
        })
        .y(function (d) {
            return +d.quality;
        })
        .height(20)
        .margin({top: 0, right: 80, bottom: 30, left: 50})
        .width(800);

//get data
    d3.json(serverUrl + "/get-data?granularity=minute", function (error, json) {
        if (error) return console.warn(error);
        var data = json.columns;

        d3.select("#visualization")
            .datum(data[0].values)
            .call(qualityView);
    });


    d3.json(serverUrl + "/get-available-columns", function (error, json) {
        if (error) return console.warn(error);

        json.columns.forEach(function(element, index, array){
            createQualityView(element, index);
        });
    });

    function createQualityView(column,index){
        //Quality Stripe of all data quality problems
        qualityViews[index+1] = qv()
            .x(function (d) {
                return new Date(+d.date);
            })
            .y(function (d) {
                return +d.quality;
            })
            .height(20)
            .margin({top: 0, right: 80, bottom: 30, left: 50})
            .width(800)
            .columnName(column.name);

        d3.json(serverUrl + "/get-data?column="+column.name+"&granularity=minute", function (error, json) {
            if (error) return console.warn(error);
            var data = json.columns;

            d3.select("#visualization")
                .datum(data[0].values)
                .call(qualityViews[index]);
        });
    }

});
