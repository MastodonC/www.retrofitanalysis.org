var annual_co2_emissions = function annual_co2_emissions(div) {
    var margin = {top: 20, right: 40, bottom: 50, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
        .range(['#6998bc', '#de6363']);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var y2Axis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .tickFormat(d3.format(".2s"));


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
        color.domain(["electrical_emissions", "gas_emissions"]);

        data.forEach(function(d) {
            var y0 = 0;
            d.emissions = color.domain().map(function(name) {
                return {name: name, y0: y0, y1: y0 += +d[name], data: d}; });
            d.total = d.emissions[d.emissions.length - 1].y1;
            d.normalised_cost = +d.normalised_cost;
        });

        data.sort(function(a, b) {
            return a.annual_emissions - b.annual_emissions;
        });
        x.domain(data.map(function(d) { return d.property; }));
        y.domain([0, 10 + d3.max(data, function(d) { return d.total; })]).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 9)
            .attr("x", 0)
            .attr("dy", ".71em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Emissions, kg carbon dioxide / m2 / year");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ",0)")
            .call(y2Axis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Emissions, kg carbon dioxide / m2 / year");

        var numberFormat = d3.format(".2f");
        
        var property = svg.selectAll(".property")
            .data(data)
            .enter().append("g")
            .attr("class", "emissions")
            .attr("transform", function(d) { return "translate(" + x(d.property) + ",0)"; })
            .on("mouseover", function() { return tooltip.style("visibility", "visible");})
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px").html('Electrical Emissions: ' + numberFormat(d3.event.currentTarget.__data__.electrical_emissions) + 'kgCO<sub>2</sub>/m<sup>2</sup><br />Gas Emissions: ' + numberFormat(d3.event.currentTarget.__data__.gas_emissions) + 'kgCO<sub>2</sub>/m<sup>2</sup><br />Total Emissions: ' + numberFormat(d3.event.currentTarget.__data__.annual_emissions) + 'kgCO<sub>2</sub>/m<sup>2</sup><br />' )
                // .style("height", "38px");
            })
            .on("mouseout", function() { return tooltip.style("visibility", "hidden");});

        property.selectAll("rect")
            .data(function(d) { return d.emissions; })
            .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill", function(d) { return color(d.name); });

        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(-825," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 36)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) {
                return d == 'electrical_emissions'  ? 'Electrical Emissions' :
                    d == 'gas_emissions'  ?  'Gas Emissions' :
                    'Unexpected Value';
            });

    });

}
