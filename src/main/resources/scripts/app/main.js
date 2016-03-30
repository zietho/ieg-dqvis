require(['d3','./app/qualityView','./app/detailView' ], function(d3,qv,dv) {

    var serverUrl = "http://localhost:8080";
    var detailViews = [];

    // ****** Quality View ****************************
    // ************************************************

    var indicators = [
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
    ];

    //create quality view
    var qualityView = qv()
        .margin({top: 25, right: 80, bottom: 0, left: 50})
        .width(880)
        .height(55)
        .serverUrl(serverUrl)
        .qualityIndicator("$.InvalidData&indicator=$.MissingData&indicator=MissingTimeStamp")
        .indicators(indicators)
        .sliderCallBack(function(evt, value){

            console.log(detailViews)

            detailViews.forEach(function(view, index, array){
                view.setRange(value);
            })

        })
        .qualityIndicatorCallBack(function(value){
            detailViews.forEach(function(view, index, array){
                view.setQualityIndicator(value);
            })
        })
        .x(function (d) {
            return new Date(+d.date);
        })



    //******** DETAIL VIEW *****************************
    //**************************************************
    //initially create one!
    var detailView;
    detailView = dv()
        .x(function (d) {
            return new Date(+d.date);
        })
        .y(function (d) {
            return +d.column;
        })
        .height(300)
        .width(800)
        .serverUrl(serverUrl)
        .id(0);


    detailViews.push(detailView);

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

        //load all stripe and draw the quality view
        d3.json(serverUrl + "/get-data?column=h&granularity=minute&load=individually", function (error, json) {
            if (error) return console.warn(error);
            var data = d3.select("#visualization")
                .datum(json.columns[0]);
            data.call(detailView);
        });

        detailView.addColumn("w");
       // detailView.addColumn("m1");
    });


    //make placeholder draggable.

    var active;
    var draggedChannel;

    //apply listener for the placeholder
    d3.select("#detailViewPlaceholder")
        .on("mouseover", function(node) {
            overDetailViewPlaceholder(node);
        })
        .on("mouseup", function(node) {
            outDetailViewPlaceholder(node);
        });

    function overDetailViewPlaceholder(d) {
        active = true;
        draggedChannel = d3.select(".dragging");
    }

    function outDetailViewPlaceholder(d) {
        active = false;

        if(draggedChannel[0][0]!=null) {
            var id = draggedChannel.attr("id");
            if (id.indexOf("qualityStripe") > -1) {
                var channel = id.split("-")[1];
                console.info("channel "+channel+"added to a new detail view!");
                draggedChannel = null;

                detailViews.push(require('./app/detailView' )());
                var newDetailView = detailViews[detailViews.length-1]
                    .x(function (d) {
                        return new Date(+d.date);
                    })
                    .y(function (d) {
                        return +d.column;
                    })
                    .height(300)
                    .width(800)
                    .serverUrl(serverUrl)
                    .id(detailViews.length-1);



                //load all stripe and draw the quality view
                d3.json(serverUrl + "/get-data?column="+channel+"&granularity=minute&load=individually", function (error, json) {
                    if (error) return console.warn(error);
                    var data = d3.select("#visualization")
                        .datum(json.columns[0]);
                    data.call(newDetailView);
                });

                newDetailView.addColumn(channel);
            }
        }
    }

});
