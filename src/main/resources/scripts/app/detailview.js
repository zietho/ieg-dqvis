define(['d3', 'd3.chart'],function(d3, _$) {
   d3.chart("QualityView", {


       initialize: function(){
           var chart = this;


           // initialize height and width from paren
           chart.h = this.base.attr("height");
           chart.w = this.base.attr("width");
           chart.margin = {
               top: 20,
               right: 80,
               bottom: 30,
               left: 50
           };

           chart.base
               .classed("QualityView", true);
           chart.layers = {};


            //init layers
           chart.layers.box = chart.base.append("rect")
               .classed("box", true)
           chart.layers.qualityTicks = chart.base.append("g")
               .classed("qualityTicks", true);


           chart.layer("box", chart.layers.box, {
               insert: function() {
                   return this.attr("class", "line")
                       .attr("x", 0)
                       .attr("y", 0)
                       .attr("width", width)
                       .attr("height", 100)
               }
           });

           chart.layer("qualityTicks", chart.layers.qualityTicks, {
               dataBind: function(data){
                   this.selectAll("rect")
                       .data(chart.data);
               },
               insert: function(){
                   return this.append('rect');
               }
           });

           var onEnter = function(){
               this.append("rect")
                   .attr("x", function (d, i) {
                       return i * (width / data.length);
                   })
                   .attr("y", 0)
                   .attr("width", function (d, i) {
                       return width / data.length;
                   })
                   .attr("height", 100)
                   .attr("fill", function (d) {
                       var red = (d.quality * 255).toFixed(0);
                       var green = (red + 25);
                       var blue = 250;

                       return "rgb(" + red + "," + green + "," + blue + ")";
                   })
           };

           chart.layer(qualityTicks).on("update", onEnter);
       },

       width: function(newWidth){
           if(arguments.length===0){
               return this.w;
           }
           this.w = new newWidth;
           return this;
       },
       height: function(newHeight) {
           if (arguments.length === 0) {
               return this.h;
           }
           this.h = newHeight;
           return this;
       },
       margin: function(newMargin){
           if(arguments.legth ===0){
               return this.margin;
           }
           this.margin = newMargin;
           return this;
       }
   });
});
