var primary_energy = function primary_energy(div) {
    var margin = {top: 20, right: 40, bottom: 50, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var y2 = d3.scale.linear()
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
        .scale(y2)
        .orient("right")
        .tickFormat(d3.format(".0f"));

    var tooltip = d3.select("body")
	.append("div")
        .attr("id", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden");


    // Define the line
    var valueline = d3.svg.line()
    // we want the point to be in the centre of the rangeband for the bar chart.
        .x(function(d) { return x(d.property)  + x.rangeBand() / 2; })
        .y(function(d) { return y2(d.annual_emissions); })
        .interpolate("linear");

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("/data/emissions.csv", function(error, data) {
        color.domain(["electrical_primary_energy_consumption", "gas_primary_energy_consumption"]);

        data.forEach(function(d) {
            var y0 = 0;
            d.emissions = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.total = d.emissions[d.emissions.length - 1].y1;
            d.annual_emissions = +d.annual_emissions;
        });

        data.sort(function(a, b) { return a.annual_emissions - b.annual_emissions; });
        x.domain(data.map(function(d) { return d.property; }));
        y.domain([0, 40 + d3.max(data, function(d) { return d.total; })]).nice();
        y2.domain([0, 10 + d3.max(data, function(d) { return d.annual_emissions; })]).nice();


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
            .text("kWh / m2 / year");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ",0)")
            .call(y2Axis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -12)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("kg carbon dioxide / m2 / year");

        var numberFormat = d3.format(".2f");
        
        var property = svg.selectAll(".property")
            .data(data)
            .enter().append("g")
            .attr("class", "emissions")
            .attr("transform", function(d) { return "translate(" + x(d.property) + ",0)"; })
            .on("mouseover", function() { return tooltip.style("visibility", "visible");})
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px").html('Electricity: ' + numberFormat(d3.event.currentTarget.__data__.electrical_primary_energy_consumption) + 'kWh/m<sup>2</sup><br />Gas: ' + numberFormat(d3.event.currentTarget.__data__.gas_primary_energy_consumption) + 'kWh/m<sup>2</sup><br />Primary Energy Consumption: ' + numberFormat(d3.event.currentTarget.__data__.primary_energy_consumption) + 'kWh/m<sup>2</sup><br />' )
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

        // Add the valueline path.
        svg.append("path")	
            .attr("class", "line")
            .attr("d", valueline(data));
        
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d.property)  + x.rangeBand() / 2; })
            .attr("cy", function(d) { return y2(d.annual_emissions); })
            .on("mouseover", function() { return tooltip.style("visibility", "visible");})
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px").html('Annual Emissions: ' + numberFormat(d3.event.currentTarget.__data__.annual_emissions) + 'kgCO<sub>2</sub>/m<sup>2</sup>')
            })
            .on("mouseout", function() { return tooltip.style("visibility", "hidden");});

        var legend = svg.selectAll(".legend")
            .data(color.domain().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(-825," + i * 20 + ")"; });

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
                console.log(d);
                return d == 'electrical_primary_energy_consumption'  ? 'Electricity primary energy' :
                    d == 'gas_primary_energy_consumption'  ?  'Gas primary energy' :
                    'Unexpected Value';
            });

    });

    var legend2 = svg.selectAll(".legend2")
        .data(["annual_emisions"])
        .enter().append("g")
        .attr("class", "legend2")
        .attr("transform", function(d, i) { return "translate(-25," + i * 20 + ")"; });

    legend2.append("rect")
        .attr("x", width - 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "#6ebd61");

    legend2.append("text")
        .attr("x", width - 15)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text("Annual carbon dioxide emissions per m2");

}
