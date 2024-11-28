import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to calculate LBR statistics
export function processShipData(data) {
    // Filter data for specific ship types
    const shipTypes = ["Battleship", "Carrier", "Cruiser"];
    const ships = data
        .filter(ship => shipTypes.some(type => ship["Ship Class"] && ship["Ship Class"].includes(type)))
        .map(ship => {
            const length = parseFloat(ship["Length"]?.split(" ")[0] || 0);
            const beam = parseFloat(ship["Beam"]?.split(" ")[0] || 0);
            if (length > 0 && beam > 0) {
                return {
                    shipType: shipTypes.find(type => ship["Ship Class"].includes(type)),
                    lbr: length / beam
                };
            }
        })
        .filter(d => d); // Exclude invalid entries

    // Group ships by type
    const grouped = d3.group(ships, d => d.shipType);

    // Calculate LBR stats for each group
    const stats = Array.from(grouped, ([shipType, values]) => {
        const lbrValues = values.map(d => d.lbr);
        const avgLBR = d3.mean(lbrValues);
        const q1 = d3.quantile(lbrValues, 0.25);
        const q3 = d3.quantile(lbrValues, 0.75);
        const iqr = q3 - q1;

        return {
            shipType,
            avgLBR,
            IQR: iqr
        };
    });

    return stats; // Return calculated statistics
}

// Function to draw the LBR chart
export function renderChart(selector, data) {
    // Set up dimensions and margins
    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 50, bottom: 50, left: 70 };

    // Create the SVG container
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define scales for the chart
    const x = d3.scaleBand()
        .domain(data.map(d => d.shipType))
        .range([margin.left, width - margin.right])
        .padding(0.4);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avgLBR + d.IQR) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Add X and Y axes
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .attr("font-size", "14px");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y))
        .attr("font-size", "14px");

    // Create tooltip for interactivity
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("display", "none")
        .style("pointer-events", "none");

    // Add bars for LBR data
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.shipType))
        .attr("y", d => y(d.avgLBR))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.avgLBR))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block").html(
                `<strong>${d.shipType}</strong><br>
                Avg LBR: ${d.avgLBR.toFixed(2)}<br>
                IQR: ${d.IQR.toFixed(2)}`
            );
            d3.select(this).attr("fill", "darkblue");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).attr("fill", "steelblue");
        });

    // Add error bars for IQR
    svg.selectAll(".error-line")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "error-line")
        .attr("x1", d => x(d.shipType) + x.bandwidth() / 2)
        .attr("x2", d => x(d.shipType) + x.bandwidth() / 2)
        .attr("y1", d => y(d.avgLBR + d.IQR))
        .attr("y2", d => y(d.avgLBR - d.IQR))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Add caps for error bars
    svg.selectAll(".error-cap")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "error-cap")
        .attr("x1", d => x(d.shipType) + x.bandwidth() / 2 - 10)
        .attr("x2", d => x(d.shipType) + x.bandwidth() / 2 + 10)
        .attr("y1", d => y(d.avgLBR + d.IQR))
        .attr("y2", d => y(d.avgLBR + d.IQR))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.selectAll(".error-cap-bottom")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "error-cap")
        .attr("x1", d => x(d.shipType) + x.bandwidth() / 2 - 10)
        .attr("x2", d => x(d.shipType) + x.bandwidth() / 2 + 10)
        .attr("y1", d => y(d.avgLBR - d.IQR))
        .attr("y2", d => y(d.avgLBR - d.IQR))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Length-to-Beam Ratio");

    // Add Y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", margin.left / 3)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "14px")
        .text("Length-to-Beam Ratio");
}
