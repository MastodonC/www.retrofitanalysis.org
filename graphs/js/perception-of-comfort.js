var comfort = function comfort(div) {
    var margin = {top: 20, right: 20, bottom: 20, left: 200},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .08);

    var x = d3.scale.linear()
        .rangeRound([0, width]);

    var color = d3.scale.ordinal()
        .range(["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues(["Post Retrofit", "Pre Retrofit"])
        .orient("left");

    var tooltip = d3.select("body")
	.append("div")
        .attr("id", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");


    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

    d3.csv("/www.retrofitanalysis.org/data/comfort_summary.csv", function(error, data) {
        color.domain(["VERYPOOR", "POOR", "MIXED", "GOOD", "EXCELLENT"]);

        data.forEach(function(d) {
            var x0 = 0;
            d.comforts = color.domain().map(function(name) { 
                return {name: name, x0: x0, x1: x0 += +d[name]}; });
            d.total = d.comforts[d.comforts.length - 1].x1;
        });

        y.domain(data.map(function(d) {
            return d.CATEGORY; }).reverse());
        x.domain([0, 10 + d3.max(data, function(d) {
            return d.total; })]).nice();

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", -15)
            .attr("dy", ".71em")
            .style("text-anchor", "end");


        var numberFormat = d3.format(".0f");
        
        var category = svg.selectAll(".category")
            .data(data)
            .enter().append("g")
            .attr("class", "comfort")
            .attr("transform", function(d) {
                return "translate(20, " + y(d.CATEGORY) + ")"; })
            .on("mouseover", function() { return tooltip.style("visibility", "visible");})
            .on("mousemove", function() {
                console.log("Tip: " + d3.event.currentTarget.__data__);
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px").html('Very Poor: ' + numberFormat(d3.event.currentTarget.__data__.VERYPOOR) + '<br />Poor: ' + numberFormat(d3.event.currentTarget.__data__.POOR) + '<br />Mixed: ' + numberFormat(d3.event.currentTarget.__data__.MIXED) + '<br />Good: ' + numberFormat(d3.event.currentTarget.__data__.GOOD) + '<br />Excellent: ' + numberFormat(d3.event.currentTarget.__data__.EXCELLENT) )
            })
            .on("mouseout", function() { return tooltip.style("visibility", "hidden");})
        ;

        category.selectAll("rect")
            .data(function(d) {
                return d.comforts; })
            .enter().append("rect")
            .attr("height", y.rangeBand())
            .attr("x", function(d) {
                return x(d.x0);
            })
            .attr("width", function(d) {
                return x(d.x1) - x(d.x0);
            })
            .style("fill", function(d) {
                return color(d.name); });

        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 66)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 42)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) {
                console.log(d);
                return d == 'VERYPOOR'  ? 'Very Poor' :
                    d == 'POOR'  ? 'Poor' :
                    d == 'MIXED'  ?  'Mixed' :
                    d == 'GOOD'  ?  'Good' :
                    'Excellent';
                 });

    });

}
