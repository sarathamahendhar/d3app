import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function histogram(dataset, containerId, title) {
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", 570)
        .attr("height", 390)
        .append("g")
        .attr("transform", "translate(50, 20)");

    //displacement values
    const displacementValues = dataset
        .map(d => (d.Displacement ? +d.Displacement.split(" ")[0].replace(",", "") : null))
        .filter(d => d !== null);
    //X-Scale
    const x = d3.scaleLinear()
        .domain([0, d3.max(displacementValues)])
        .range([0, 500]);

    const bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10))(displacementValues);
    //Y-Scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([300, 0]);

    // Draw Bars
    svg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => 300 - y(d.length))
        .attr("fill", "green")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "yellow");
            d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "lightgray")
                .style("padding", "5px")
                .style("border", "1px solid black")
                .style("border-radius", "3px")
                .style("display", "block")
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`)
                .text(`Count: ${d.length}`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "green");
            d3.select(".tooltip").remove();
        });
    // Adding X-axis
    svg.append("g")
        .attr("transform", "translate(0,300)")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");
    // Adding Y-axis
    svg.append("g")
        .call(d3.axisLeft(y));
    // Adding title
    svg.append("text")
        .attr("x", 250)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);
}
