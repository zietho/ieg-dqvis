require(['../../../main/resources/scripts/lib/d3'], function(d3) {

    d3.selectAll("li").style({'color': 'green', 'stroke-width': 2}).property({'test':123});

    var div = d3.select("body").selectAll("div")
        .data([4, 8, 15, 16, 23, 42])
        .enter().append("div")
        .text(function(d) { return d; });
    div.exit().remove();
});