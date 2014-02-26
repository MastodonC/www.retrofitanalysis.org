var pp_air_tightness = function pp_air_tightness(div) {
    var margin = {top: 20, right: 80, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(0)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.number); })
        .y(function(d) { return y(d.tightness); });

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("/data/airtightness.csv", function(error, data) {
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "number"; }));

        data.forEach(function(d) {
            d.number = +d.number;
        });

        var metric = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {number: d.number, tightness: +d[name]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.number; }));

        y.domain([
            d3.min(metric, function(c) { return d3.min(c.values, function(v) { return v.tightness; }); }),
            d3.max(metric, function(c) { return d3.max(c.values, function(v) { return v.tightness; }); })
        ]).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("x", width)
            .attr("y", 40)
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
            .text("Relative frequency");

        var series = svg.selectAll(".series")
            .data(metric)
            .enter().append("g")
            .attr("class", "series");

        series.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); });

        var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")"; });

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
                return d == 'post_air_tightness'  ? 'Post-retrofit' :
                    d == 'pre_air_tightness'  ?  'Pre-retrofit' :
                    'Unexpected Value';
            });

    });
}
