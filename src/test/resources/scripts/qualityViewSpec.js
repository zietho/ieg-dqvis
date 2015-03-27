define(['d3','app/qualityview'], function(d3,qv) {

    describe("the test data", function(){
        var data;

        beforeEach(function(done){
            //load data
            d3.json("base/src/test/resources/data/test.json", function (error, json) {
                if (error) return console.warn(error);
                data = json;
                done();
            });
        });
        it("to be not undefined", function(){
            expect(data).not.toBeUndefined();
        });
        it("to be 120 elements in the test data", function(){
            expect(data.length).toBe(120);
        });
    });

    describe("the layers", function(){
        var data,
            qualityView;

        beforeEach(function(done){
            //create qualityView
            qualityView =  qv()
                .height(50)
                .width(800)
                .margin({top: 0, right: 80, bottom: 30, left: 50});
            //load data
            d3.json("base/src/test/resources/data/test.json", function (error, json) {
                if (error) return console.warn(error);
                data = json;
                done();
            });
        });
        it("to be not undefined", function(){
            d3.select("body")
                .datum(data[0].values)
                .call(qualityView);

            d3.select("body").
        });
        it("to be 120 elements in the test data", function(){
            expect(data.length).toBe(120);
        });
    });










    //describe("create quality view", function(){
    //    it("to be false", function(){
    //        d3.select("body")
    //            .datum(data)
    //        expect(qualityView).not.toBeNull();
    //    })
    //});
    //describe("check layers", function(){
    //    it("to be the set height", function(){
    //
    //
    //
    //        expect(qualityView).not.toBeNull();
    //    })
    //});


});