//function QualityBarView() {
define(['d3','jquery','./qualityStripe', './qualitySlider', 'colorbrewer'], function (d3, jQuery,qualityStripe,qualitySlider,colorbrewer) {

    //create closure
    function qualityView(selection) {
        //init + set defaults
        var margin = {top: 30, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom,
            svg,
            g,
            serverUrl,
            layers={},
            qualityStripes= {},
            columns=[],
            tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0),
            qualityIndicator,
            drag,
            invisibleQualityStripes = false,
            addSign,
            invisibles = [],
            addQualityStripePanel,
            colorScale = d3.scale.ordinal()
                .domain([0,1,2,3])
                .range([colorbrewer.Reds[9], colorbrewer.Blues[9], colorbrewer.Greens[9], colorbrewer.Purples[9]]),
            indicators = [],
            sliderCallBack,
            qualityIndicatorCallBack,
            xScale = d3.time.scale(), //set x-scale and range
            xAxis = d3.svg.axis().scale(xScale).orient("top"),
            qualityStripeHeight = 25,
            qualityStripeMarginTop = 5;

        // LAYERS
        layers.qualityStripes = function(){
            var qualityStripes = svg.append("g")
                .classed("qualityStripes", true)
                .attr("id", "qualityStripes")
                .attr("transform", "translate("+margin.left+","+margin.top+")");

            qualityStripes
                .append("g")
                .attr("id", "allQualityStripe")
                .attr("width", width);
            qualityStripes
                .append("g")
                .attr("id", "individualQualityStripes")
                .attr("transform", "translate(0,30)")
                .classed("invisible", true);

            return qualityStripes;
        }

        layers.axes = function() {
            //x-axis
            svg.append("g")
                .attr("class", "time axis")
                .attr("transform", "translate("+margin.left+","+(margin.top-1)+")");
        }

        layers.individualQualityStripes = function(){
            return qualityStripes;
        }

        layers.qualityIndicator = function(){
            var select = d3.select(svg.node().parentNode)
                .append("select")
                .attr("id", "qualityIndicatorSelect");

            select
                .on("change", changeDataQualityIndicator);

            select
                .selectAll("option")
                .data(indicators)
                .enter()
                .append("option")
                .attr("value", function(d){return d.value})
                .text(function(d) { return d.text});

            return select;
        }

        layers.toggle = function(){
            var toggle = svg.append("polygon")
                    .classed("qualityStripeToggle", true)
                    .attr("fill", "grey")
                    .attr("stroke", "grey")
                    .attr("points", "00,00 10,20 20,00")
                    .attr("transform", "translate(0,"+margin.top+")")
                    .on("click", toggleIndividualQualityStripes)
                    .on("mouseover", showToggleTooltip)
                    .on("mouseout", hideToggleTooltip);

            return toggle;
        }

        layers.addSign= function(){
            addSign = svg
                .append("text")
                .classed("invisible", true)
                .attr("id","addSign")
                .attr("x", 0)
                .attr("y",50)
                .text("+")
                .on("click", showHiddenQualityStripes);
        }

        layers.addQualityStripesPanel = function(){
            addQualityStripePanel = svg
                .append("g")
                .classed("invisible", true)
                .attr("id", "invisibleQualityStripes")
                .attr("transform", "translate(0,"+75+")");
        }

        layers.addQualityStripesTexts = function(data){
            var invisibleStripeTexts = addQualityStripePanel
                .selectAll("text")
                .data(data);

            //update = enter selection
            invisibleStripeTexts
                .enter()
                .append("text")
                .text(function(d, i){
                    return d;
                })
                .on("click", reAddQualityStripe)
                .attr("x",0)
                .attr("y", function(d,i){
                    return i*30;
                })
                .classed("invisbleQualityStripe", true);

            //exit selection
            invisibleStripeTexts
                .exit()
                .remove();
        }

        layers.timeSlider = function(){
            var timeSlider = qualitySlider()
                .value([33,66])
                .baseHeight(25)
                .scale(d3.scale.linear().domain([0, 100]).rangeRound([0, width-margin.right]))
                .on("slide", function(evt, value) {
                    sliderCallBack(evt, value);
                    console.log(value);
                });

            console.log("slider width: "+width);

            d3.select("#allQualityStripe").call(timeSlider);
        }

        function chart(selection) {
            //add new svg
            svg = selection.append("svg");
            svg.attr("width", width)
                .attr("height", height)
                .attr("id", "qualityView");

            //add layers
            layers.axes();
            layers.toggle();
            layers.addSign();
            layers.addQualityStripesPanel();
            layers.qualityStripes();
            layers.qualityIndicator();
            layers.timeSlider();


            console.log("margin top: "+margin.top);
            console.log("width of quality Stripe: "+width);
            console.log(d3.selectAll("#allQualityStripe"));
            // update x and y scales (i.e, domain + range)
            //xScale
            //    .domain(d3.extent(data.values, xValue))
            //    .range([0,width]);
        }

        // INTERACTION
        function toggleIndividualQualityStripes(){
            var toggle = d3.select(this),
                iqs = d3.select("#individualQualityStripes");

            if(iqs.classed("visible")){
                iqs
                    .classed("visible", false)      //remove class if class was already active
                    .classed("invisible", true);    //add invisibility
                addQualityStripePanel
                    .classed("visible", false)
                    .classed("invisible", true);
                toggle
                    .transition()
                    .attr("points", "00,00 10,20 20,00");
                if(invisibleQualityStripes){
                    hideAddSign();
                }

                //TODO   implement calculation for dynamic calculation of height.
                svg.transition().attr("height", height);

            }else{
                iqs
                    .classed("visible", true)
                    .classed("invisible", false);
                toggle
                    .transition()
                    .attr("points", "00,20 10,00 20,20");
                addQualityStripePanel
                    .classed("visible", true)
                    .classed("invisible", false);
                svg.transition().attr("height", (height+columns.length*(qualityStripeHeight+qualityStripeMarginTop)));

                if(invisibleQualityStripes){
                    showAddSign();
                }
            }
        }

        function showToggleTooltip(tooltipText){
            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9);
            tooltip
                .html("press to show individual channels")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }

        function hideToggleTooltip(){
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        }

        function changeDataQualityIndicator(){
            var currentValue = d3.event.target.value;
            var palette = colorScale(d3.event.target.selectedIndex);

            d3.selectAll(".qualityStripe").each(function(d,i){
                var currentQualityStripe = d3.select(this);
                var column = currentQualityStripe.select(".qualityViewLegendText").text();

                d3.json(serverUrl + "/get-data?column="+column+"&granularity=minute&indicator="+currentValue, function (error, json) {
                    if (error) return console.warn(error);
                    qualityStripes[column].colorPalette(palette);
                    qualityStripes[column].redraw(json.columns[0].values);
                });
            })

            //call back for detail view here!
            qualityIndicatorCallBack(currentValue);


            qualityIndicator = currentValue; //set qualityIndicator
        }

        function reAddQualityStripe(d){
            var columnName = d;

            //in the invisible data quality panel remove
            var index = jQuery.inArray(columnName, invisibles);
            invisibles.splice(index,1); //delete from data
            layers.addQualityStripesTexts(invisibles); // redraw

            //in the individual quality stripes add
            d3.json(serverUrl + "/get-data?column="+columnName+"&granularity=minute&indicator="+qualityIndicator, function (error, json) {
                if (error) return console.warn(error);

                //dispose old one
                if(typeof qualityStripes[columnName] != 'undefined'){
                    delete qualityStripes[columnName];
                }
                var a = this;
                //add new one
                chart.addQualityStripe(json.columns[0])

            });
        }

        function showHiddenQualityStripes(){
            layers.addQualityStripesTexts(invisibles);
        }

        function hideAddSign(){
            addSign.classed("visible", false);
            addSign.classed("invisible", true);
        }

        function showAddSign(){
            addSign.classed("visible", true);
            addSign.classed("invisible", false);
        }

        // SETTER n GETTER
        chart.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };
        chart.width = function (_) {
            if (!arguments.length) return width;
            width = _;
            return chart;
        }
        chart.height = function (_) {
            if (!arguments.length) return height;
            height = _;
            return chart;
        };
        chart.x = function (_) {
            if (!arguments.length) return xValue;
            xValue = _;
            return chart;
        };
        chart.y = function (_) {
            if (!arguments.length) return yValue;
            yValue = _;
            return chart;
        }
        chart.addColumn = function(_){
            if (!arguments.length) return null;
            columns.push(_);
            return chart;
        }
        chart.serverUrl = function(_){
            if (!arguments.length) return serverUrl;
            serverUrl = _;
            return chart;
        }
        chart.addQualityStripe = function(column){
            var newQualityStripe = qualityStripe()
            .height(qualityStripeHeight)
            //.margin({top: 0, right: 0, bottom: 0, left: 0})
            .width(width-margin.right)
            .observer(this)
            .columnName(column.name);

            if(column.name==="all"){
                // update x and y scales (i.e, domain + range)
                xScale
                    .domain(d3.extent(column.values, xValue))
                    .range([0,width-margin.right]);

                console.log(column);
                //update axes
                d3.select(".time.axis").call(xAxis);
            }


            d3.select((column.name == "all") ?
                    "#allQualityStripe" :
                    "#individualQualityStripes"
            )
            .datum(column.values)
            .call(newQualityStripe);
            qualityStripes[column.name] = newQualityStripe;


        }
        chart.removeQualityStripe = function(selection){
            //first handle hidding
            if(invisibleQualityStripes == false){
                invisibleQualityStripes = true;
                showAddSign();
            }

            var current = selection.node();
            var translate = false;

            //translate others to the right position
            d3.selectAll("g.qualityStripe").each(function(d,i) {
                if(!translate)
                    if(current == this)
                        translate = true;
                if (current != this && translate) {
                    var x = (qualityStripeHeight+qualityStripeMarginTop*(i-1))-(qualityStripeHeight+qualityStripeMarginTop)
                    d3.select(this)
                        .transition()
                        .attr("transform", "translate(0,"+x+")");
                }
            });

            //store removed element to invisibles
            invisibles.push(selection.select(".qualityViewLegendText").text());
            layers.addQualityStripesTexts(invisibles);
            selection.transition().remove();
        }
        chart.qualityIndicator = function (_) {
            if (!arguments.length) return qualityIndicator;
            qualityIndicator = _;
            return chart;
        }

        chart.getTooltip = function () {
            return tooltip;
        }

        chart.getColourPaletteOfIndicator = function(indicator){

            var palette = [];

            indicators.forEach(function(element,index,array){
                if(element.value == indicator){
                    palette = colorScale(index);
                }
            });

            return palette;
        }

        chart.indicators = function(_){
            if(!arguments.length) return indicators;
            indicators = _;
            return chart;
        }

        chart.sliderCallBack = function(_){
            if(!arguments.length) return sliderCallBack;
            sliderCallBack = _;
            return chart;
        }

        chart.qualityIndicatorCallBack = function(_){
            if(!arguments.length) return qualityIndicatorCallBack;
            qualityIndicatorCallBack = _;
            return chart;
        }

        //added from detail
        chart.xScale = function () {
            return xScale;
        }

        chart.xAxis = function () {
            return xAxis;
        }

        function X(d) {
            return xScale(d.date);
        }

        return chart;
    };

    return qualityView; //return and execute object within the closure
});
