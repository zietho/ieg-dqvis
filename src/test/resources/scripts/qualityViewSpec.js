define(['d3','d3.chart','app/qualityview'], function(d3,qv) {
    describe("create quality view", function(){
        it("to be false", function(){

            var qualityView = qv
                .x(function (d) {
                    return new Date(+d.date);
                })
                .y(function (d) {
                    return +d.quality;
                })
                .height(100)
                .margin({top: 0, right: 80, bottom: 30, left: 50});

            expect(qualityView).not.toBeNull();
        })
    });
    describe("createQualityView", function(){
        it("to be false", function(){

            var qualityView = qv
                .x(function (d) {
                    return new Date(+d.date);
                })
                .y(function (d) {
                    return +d.quality;
                })
                .height(100)
                .margin({top: 0, right: 80, bottom: 30, left: 50});

            expect(qualityView).not.toBeNull();
        })
    });

    describe("createQualityView", function(){
        it("to be false", function(){

            var qualityView = qv
                .x(function (d) {
                    return new Date(+d.date);
                })
                .y(function (d) {
                    return +d.quality;
                })
                .height(100)
                .margin({top: 0, right: 80, bottom: 30, left: 50});

            expect(qualityView).not.toBeNull();
        })
    });
});




/*
var qualityView = qv
    .x(function (d) {
        return new Date(+d.date);
    })
    .y(function (d) {
        return +d.quality;
    })
    .height(100)
    .margin({top: 0, right: 80, bottom: 30, left: 50});

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



*/