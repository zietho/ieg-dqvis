define(['d3','jquery'], function (d3, jQuery) {

    /*
    * inspired by the d3 slider from https://github.com/turban/d3.slider
    * */

    function qualitySlider() {

        // Public variables width default settings
        var min = 0,
            max = 100,
            step = 1,
            value,
            active = 1,
            scale,
            baseHeight,
            handleWidth = 5,
            rangeValue,
            p1,
            p2;

        // Private variables
        var axisScale,
            dispatch = d3.dispatch("slide"),
            handle1,
            handle2 = null,
            range,
            sliderLength,
            xDiff=0;

        function slider(selection) {
            selection.each(function () {

                //set vars
                var qualityStripe = d3.select(this);
                scale = scale || d3.scale.linear().domain([min, max]);
                sliderLength =  d3.max(scale.range());
                value = value || scale.domain()[0];

                //set drag behavior
                var drag = d3.behavior.drag()
                    .on("dragstart", onDragStart)
                    .on("drag", onDragHorizontal)
                    .on("dragend", onDragEnd);

                var sliderGroup = d3.select("#qualityStripes")
                    .insert("g", "#individualQualityStripes")
                    .attr("id","qualityTimeSlider");

                range = sliderGroup
                    .append("rect")
                    .classed("d3-slider-range", true)
                    .attr("x", scale(value[0])+handleWidth)
                    .attr("height", baseHeight)
                    .attr("width", scale(value[1])-scale(value[0])-handleWidth)
                    .attr("stroke", "grey")
                    .attr("fill", "white")
                    .attr("fill-opacity", 0.5)
                    .attr("id", "range")
                    .call(drag);

                handle1 = sliderGroup
                    .append("rect")
                    .classed("d3-slider-handle", true)
                    .attr('id', "handle-one")
                    .attr("x", scale(value[0]))
                    .attr("width",handleWidth)
                    .attr("height", baseHeight)
                    .call(drag);

                handle2 = sliderGroup
                    .append("rect")
                    .classed("d3-slider-handle", true)
                    .attr('id', "handle-two")
                    .attr("x", scale(value[1]))
                    .attr("width",handleWidth)
                    .attr("height", baseHeight)
                    .call(drag);

                rangeValue = scale.invert(range.attr("x"));


                var xP1 = scale(value[0])-5;
                p1 = sliderGroup
                    .append("polygon")
                    .classed("handle1Triangle", true)
                    .attr("id", "handle-triangle-one")
                    .attr("fill", "black")
                    .attr("stroke", "black")
                    .attr("points", "00,00 7.5,15 15,00")
                    .attr("transform", "translate("+(xP1)+",-15)")
                    .call(drag);

                var xP2 = scale(value[1])-5;
                p2 = sliderGroup
                    .append("polygon")
                    .classed("handle2Triangle", true)
                    .attr("id", "handle-triangle-two")
                    .attr("fill", "black")
                    .attr("stroke", "black")
                    .attr("points", "00,00 7.5,15 15,00")
                    .attr("transform", "translate("+(xP2)+",-15)")
                    .call(drag);



                function onDragHorizontal() {
                    if(xDiff==0) {
                        var x = parseInt(d3.select(this).attr("x"));
                        if(isNaN(x)){
                            var t = d3.transform(d3.select(this).attr("transform"));
                            x = parseInt(t.translate[0]);
                        }

                        console.log("x is "+x);
                        xDiff = d3.event.x - x;
                    }



                    var id = d3.select(this).attr("id");
                    if (id === "handle-one" || id==="handle-triangle-one") {
                        active = 1;
                    } else if (id === "handle-two" || id==="handle-triangle-two") {
                        active = 2;
                    }

                    var pos = Math.max(0, Math.min(sliderLength, d3.event.x-xDiff));

                    if(id!== "range") {
                        moveHandle(pos)
                    }else{
                        var rangeWidth = parseInt(d3.select(this).attr("width"));
                        ///@TODO improve border values
                        //console.log("xdiff:"+xDiff);
                        //console.log("pos:"+pos);
                        //console.log(sliderLength);
                        if(pos-handleWidth>=0 && (pos+rangeWidth)<= sliderLength) {
                            moveRange(pos);
                        }
                    }
                }

                function onDragStart(){
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).classed("dragging", true);
                }

                function onDragEnd(){
                    xDiff=0;
                    dispatch.slide(d3.event.sourceEvent || d3.event, value);
                    d3.select(this).classed("dragging", false);
                }

            });
        }

        // Move slider handle on click/drag
        function moveHandle(newValue) {
            newValue = stepValue(scale.invert(newValue));

            var oldPos = scale(value[active - 1]),
                newPos = scale(newValue);

            if (oldPos !== newPos) {
                value[active - 1] = newValue;
                var newRange = scale(value[1])-scale(value[0]);
                if (value[0] >= value[1]) return;

                if (active === 1) {
                    handle1.attr("x", newPos);
                    range.attr("x", parseInt(newPos)+parseInt(handleWidth));
                    rangeValue = newValue+scale.invert(handleWidth);
                    range.attr("width",newRange-handleWidth);
                    p1.attr("transform", "translate("+(newPos-5)+",-15)")
                    //}
                } else {
                    handle2.attr("x", newPos);
                    range.attr("width", newRange-handleWidth);
                    p2.attr("transform", "translate("+(newPos-5)+",-15)")
                }


            }
        }

        function moveRange(newValue){
            newValue = stepValue(scale.invert(newValue));

            var oldPos = scale(rangeValue),
                newPos = scale(newValue);

            if (oldPos !== newPos){
                rangeValue=newValue;
                var currentXH1 = parseInt(handle1.attr("x"));
                var currentXH2 = parseInt(handle2.attr("x"));
                movedBy = newPos-oldPos;
                currentXH1 += movedBy;
                currentXH2 += movedBy;
                value[0] = scale.invert(currentXH1);
                value[1] = scale.invert(currentXH2);


                handle1.attr("x", parseInt(scale(value[0])));
                handle2.attr("x", parseInt(scale(value[1])));
                p1.attr("transform", "translate("+(parseInt(scale(value[0]))-5)+",-15)")
                p2.attr("transform", "translate("+(parseInt(scale(value[1]))-5)+",-15)")
                range.attr("x", parseInt(newPos));

                //TODO - move whole slider instead of parts?
                //sliderGroup.attr("x", parseInt(sliderGroup.attr("x")+=movedBy));
            }
        }

        // Calculate nearest step value
        function stepValue(val) {
            if (val === scale.domain()[0] || val === scale.domain()[1]) {
                return val;
            }

            var valModStep = (val - scale.domain()[0]) % step,
                alignValue = val - valModStep;

            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += (valModStep > 0) ? step : -step;
            }

            return alignValue;
        }

        // Getter/setter functions
        slider.min = function (_) {
            if (!arguments.length) return min;
            min = _;
            return slider;
        };

        slider.max = function (_) {
            if (!arguments.length) return max;
            max = _;
            return slider;
        };

        slider.step = function (_) {
            if (!arguments.length) return step;
            step = _;
            return slider;
        };

        slider.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return slider;
        };

        slider.value = function (_) {
            if (!arguments.length) return value;
            if (value) {
                moveHandle(stepValue(_));
            }
            ;
            value = _;
            return slider;
        };

        slider.scale = function (_) {
            if (!arguments.length) return scale;
            scale = _;
            return slider;
        };

        slider.baseHeight = function (_) {
            if (!arguments.length) return baseHeight;
            baseHeight= _;
            return slider;
        };

        slider.handleWidth = function (_) {
            if (!arguments.length) return handleWidth;
            handleWidth= _;
            return slider;
        };

        d3.rebind(slider, dispatch, "on");

        return slider;
    }

    return qualitySlider;
});