var air_tightness = function air_tightness(div) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 60])
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("/data/emissions.csv", function(error, data) {
        data.forEach(function(d) {
            d.annual_emissions = +d.annual_emissions;
            d.post_air_tightness = +d.post_air_tightness;
        });

        x.domain(d3.extent(data, function(d) { return d.post_air_tightness; })).nice();
       // y.domain(d3.extent(data, function(d) { return d.annual_emissions; })).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Air-tightness - m3 / m2 / hr at 50Pa");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Emissions, kg carbon dioxide / m2 / year")

        var numberFormat = d3.format(".2f");
        
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.post_air_tightness); })
            .attr("cy", function(d) { return y(d.annual_emissions); })
            .on("mouseover", function() { return tooltip.style("visibility", "visible");})
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px").html('Property: ' + d3.event.currentTarget.__data__.property + '<br />'
                                                                                                                   + 'Annual CO<sub>2</sub>: ' + numberFormat(d3.event.currentTarget.__data__.annual_emissions) + '<br />'
                                                                                                                   + 'Air Tightness: ' + numberFormat(d3.event.currentTarget.__data__.post_air_tightness) )
                //.style("height", "14px");
            })
            .on("mouseout", function() { return tooltip.style("visibility", "hidden");});

        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

    });
}
