define(['d3','app/qualityview'], function(d3,qv) {

    describe("the the quality view", function(){
        var data,
            dataQualityView;

        beforeEach(function(done){
            //load data
            getData(done);

        });

        afterEach(function(done){
            data = null;
        });

        describe("test the data ", function(){
            it("to be not undefined", function(){
                expect(data).not.toBeUndefined();
            });
            it("to be 120 elements in the test data", function(){
                expect(data.length).toBe(120);
            });
        });

        describe("test the layers", function(){
            beforeEach(function(){
                //create qualityView
                qualityView =  qv()
                    .height(50)
                    .width(800)
                    .margin({top: 0, right: 80, bottom: 30, left: 50});
            });

            afterEach(function(){
                qualityView = null;
                d3.selectAll("svg").remove();
            })

            it("to be not undefined", function(){
                d3.select("body")
                    .datum(data[0].values)
                    .call(qualityView);

                d3.select("body");
            });
            it("to be 120 elements in the test data", function(){
                expect(data.length).toBe(120);
            });
        });
    });

    describe("test resize"), function(){
    });

    function getData(done){
        d3.json("base/src/test/resources/data/test.json", function (error, json) {
            if (error) return console.warn(error);
            data = json;
            if (arguments.length>=1)
                done();
        });
    }

});