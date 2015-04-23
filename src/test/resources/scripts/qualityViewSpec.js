define(['d3','jquery','app/qualityView', 'app/qualityStripe', 'colorbrewer'], function(d3,jQuery,qv,qs,colorbrewer) {

    describe("the the quality view", function(){
        var data,
            qualityView;

        beforeEach(function(done){
            //load data
            getData(done);

        });

        afterEach(function(){
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

                d3.select("body")
                    .datum(data[0].values)
                    .call(qualityView);
            });

            afterEach(function(){
                qualityView = null;
                d3.selectAll("svg").remove();
            })

            it("should have a defined svg element", function(){
               var svg = d3.select("svg").node();
                expect(svg).not.toBeNull();
            });

            it("should have a defined toggle", function(){
                var toggle = d3.select("qualityStripeToggle");
                expect(toggle).not.toBeNull();
            });

            it("should have a quality stripe layer", function(){
                var qualityStripes = d3.select("qualityStripes");
                expect(qualityStripes).not.toBeNull();
            });

            it("should have a quality stripes layer", function(){
                var allQualityStripes = d3.select("allQualityStripe");
                expect(allQualityStripes).not.toBeNull();
            });

            it("should have an individual quality stripes element in the quality stripes layer", function(){
                var individualQualityStripes = d3.select("individualQualityStripes");
                expect(individualQualityStripes).not.toBeNull();
            });

            it("should have a quality indicator layer", function(){
                var qualityIndicatorSelect = d3.select("qualityIndicatorSelect");
                expect(qualityIndicatorSelect).not.toBeNull();
            });

            it("should have an all quality stripe", function(){
                var column = {
                    name: "all",
                    values: data
                };
                qualityView.addQualityStripe(column);


                var allQualityStripe = d3.select("#allQualityStripe").select("g.qualityStripe");
                expect(allQualityStripe).not.toBeNull();

                var numberOfChildren = allQualityStripe[0].length;
                expect(numberOfChildren).toBe(1);

                var id =d3.select(allQualityStripe.node()).attr("id");
                expect(id).toBe("qualityStripe.all");
            });

            it("should have an individual quality stripe", function(){
                var column = {
                    name: "anything",
                    values: data
                };
                qualityView.addQualityStripe(column);

                var individualQualityStripe = d3.select("#individualQualityStripes").select("g.qualityStripe");
                expect(individualQualityStripe).not.toBeNull();

                var numberOfChildren = individualQualityStripe[0].length;
                expect(numberOfChildren).toBe(1);

                var id =d3.select(individualQualityStripe.node()).attr("id");
                expect(id).toBe("qualityStripe.anything");

            });

            it("should have an quality stripe with the right colour", function(){
                var qualityIndicatorSelect = d3.select("qualityIndicatorSelect");
                var column = {
                    name: "h",
                    values: data
                };
                qualityView.addQualityStripe(column);

                var qualityTicks = d3.select("g.qualityStripe").selectAll("rect.qualityTick");
                var qualityTick107 = d3.select(qualityTicks[0][107]);
                var tickColor =  qualityTick107.attr("fill");
                var quality = qualityTick107.data()[0].quality;

                colorScale = d3.scale.ordinal()
                    .domain([0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0])
                    .range(colorbrewer.Reds[9]);

                var color = d3.rgb(colorScale(1-quality));
                var expectedColor = "rgb("+color.r+","+color.g+","+color.b+")";
                colorbrewer.Reds[9]
                expect(tickColor).toBe(expectedColor);
            });

            it("should have a time slider layer", function(){
                var timeSlider = d3.select("#qualityTimeSlider").node();
                expect(timeSlider).not.toBeNull();
            })

            it("time slider should be last child", function(){
                var column = {
                    name: "anything",
                    values: data
                };
                qualityView.addQualityStripe(column);

                var timeSlider = jQuery("#qualityTimeSlider").get(0);
                var sibling = jQuery("#allQualityStripe").next().get(0);
                expect(timeSlider.isEqualNode(sibling)).toBe(true);
            })

            it("should have a hidden plus sign to add hidden channels", function(){
                var addSign = d3.select("#addSign")
                expect(addSign.node().tagName).toBe("text");
                expect(addSign.node().textContent).toBe("+");
                expect(addSign.classed("invisible")).toBe(true);
            })
            it("should have a slider with a range and two handles", function(){
                var slider = d3.select("#qualityTimeSlider")
                expect(slider.node().tagName).toBe("g");
                var rangeLength = slider.selectAll("rect.d3-slider-range")[0].length;
                expect(rangeLength).toBe(1);
                var handleLength = slider.selectAll("rect.d3-slider-handle")[0].length;
                expect(handleLength).toBe(2);
            })

        });

        function getData(done){
            d3.json("base/src/test/resources/data/test.json", function (error, json) {
                if (error) return console.warn(error);
                data = json;
                if(arguments.length>=1)
                    done();
            });
        }
    });
});