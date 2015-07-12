require(['d3','./app/qualityView','./app/detailView' ], function(d3,qv,dv) {

    var serverUrl = "http://localhost:8080";


    // ****** Quality View ****************************
    // ************************************************

    //create quality view
    var qualityView = qv()
        .margin({top: 0, right: 80, bottom: 30, left: 50})
        .width(800)
        .height(300)
        .serverUrl(serverUrl)
        .qualityIndicator("$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp")
        .indicators([
            {
                value: "$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp",
                text: "All",
                shortText: "All"
            },
            {
                value: "$.MissingData",
                text: "Missing Values",
                shortText: "MV"
            },
            {
                value: "$.InvalidData",
                text: "Invalid Values",
                shortText: "IV"
            },
            {
                value: "MissingTimeStamp",
                text: "Missing Timestamp",
                shortText: "MT"
            }
        ])
        .sliderCallBack(function(evt, value){
            detailView.setRange(value);
        })

    //load all stripe and draw the quality view
    d3.json(serverUrl + "/get-data?column=all&granularity=minute", function (error, json) {
        if (error) return console.warn(error);
        d3.select('#visualization')
            .call(qualityView);
        qualityView.addQualityStripe(json.columns[0]);
    });

    //lazy load the individual stripes
    d3.json(serverUrl + "/get-available-columns", function (error, json) {
        if (error) return console.warn(error);
        //build request URL for the
        var requestUrl = serverUrl + "/get-data?granularity=minute";
        json.columns.forEach(function(element, index, array){
            //add the column to the
            requestUrl += "&column="+element.name;
            //additionally add the column to the qualityView
            qualityView.addColumn(element.name);
        });
        requestUrl+= "&load=individually";

        d3.json(requestUrl, function (error, json) {
            json.columns.forEach(function(element, index, array){
                qualityView.addQualityStripe(element);
            });
        })
    });

     //******** DETAIL VIEW *****************************
     //**************************************************
    var detailView = dv()
            .x(function(d) { return new Date(+d.date);})
            .y(function(d) { return +d.column;})
            .height(300)
            .width(800)
            .serverUrl(serverUrl);

    //load all stripe and draw the quality view
    d3.json(serverUrl + "/get-data?column=h&granularity=minute&load=individually", function (error, json) {
        if (error) return console.warn(error);
        var data = d3.select("#visualization")
            .datum(json.columns[0]);
        data.call(detailView);
    });

    detailView.addColumn("w");
    detailView.addColumn("m1");

});
