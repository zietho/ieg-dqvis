require(['d3','./app/qualityView' ], function(d3,qv) {

    var serverUrl = "http://localhost:8080";


    // ****** Quality View ****************************
    // ************************************************

    //create quality view
    var qualityView = qv()
        .height(20)
        .margin({top: 0, right: 80, bottom: 30, left: 50})
        .width(800)
        .serverUrl(serverUrl)
        .qualityIndicator("$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp");

    //load all stripe and draw the quality view
    d3.json(serverUrl + "/get-data?column=all&granularity=minute", function (error, json) {
        if (error) return console.warn(error);
        console.log(json.columns[0]);

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
               console.log(element);
                qualityView.addQualityStripe(element);
            });
        })
    });

    // ******** DETAIL VIEW *****************************
    // **************************************************

});
