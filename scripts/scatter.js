import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to create scatter plot
export function createScatterPlot(data, containerId) {
    const preparedData = data
        .map(ship => {
            const length = parseFloat(ship["Length"]?.split(" ")[0] || 0);
            const beam = parseFloat(ship["Beam"]?.split(" ")[0] || 0);
            const displacement = parseFloat(ship["Displacement"]?.split(" ")[0] || 0);
            return length > 0 && beam > 0 && displacement > 0
                ? {
                      shipClass: ship["Ship Class"] || "Unknown",
                      lbr: length / beam,
                      displacement
                  }
                : null;
        })
        .filter(Boolean);

    // Dimensions set up
    const margin = { top: 20, right: 50, bottom: 50, left: 70 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // SVG Creation
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale
    const x = d3.scaleLinear()
        .domain(d3.extent(preparedData, d => d.lbr))
        .nice()
        .range([0, width]);

    // Y Scale
    const y = d3.scaleLinear()
        .domain(d3.extent(preparedData, d => d.displacement))
        .nice()
        .range([height, 0]);

    // Color Scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Adding the X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Adding the Y-axis
    svg.append("g").call(d3.axisLeft(y));

    // Adding the scatter points
    svg.selectAll("circle")
        .data(preparedData)
        .join("circle")
        .attr("cx", d => x(d.lbr))
        .attr("cy", d => y(d.displacement))
        .attr("r", 5)
        .attr("fill", d => color(d.shipClass))
        .attr("opacity", 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 8).attr("stroke", "black");
            svg.append("text")
                .attr("id", "hover-text")
                .attr("x", x(d.lbr) + 10)
                .attr("y", y(d.displacement) - 10)
                .text(d.shipClass)
                .attr("font-size", "10px")
                .attr("fill", "black");
        })
        .on("mouseout", function () {
            // Reset point size
            d3.select(this).attr("r", 5).attr("stroke", "none");
            svg.select("#hover-text").remove();
        });

    // Adding the title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Scatter Plot of LBR vs. Displacement");

    // Adding X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Length-to-Beam Ratio (LBR)");

    // Adding Y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Displacement");
}
