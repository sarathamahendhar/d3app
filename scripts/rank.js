import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Function to aggregate ship data
function aggregateShipData(data) {
    // Count occurrences of each ship class
    const shipClassCounts = data.reduce((acc, ship) => {
        acc[ship["Ship Class"]] = (acc[ship["Ship Class"]] || 0) + 1;
        return acc;
    }, {});

    // Convert counts to an array and sort by descending order
    return Object.entries(shipClassCounts)
        .map(([shipClass, count]) => ({ shipClass, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Get the top 20 ship classes
}

// Function to create the rank chart
export function createRankChart(data, containerId) {
    console.log(aggregateShipData(data)); // Log aggregated data
    const sortedClasses = aggregateShipData(data); // Prepare sorted ship classes
    console.log("Sorted Classes:", sortedClasses);

    // Extract classes and counts for the chart
    const classes = sortedClasses.map(d => d.shipClass);
    const counts = sortedClasses.map(d => d.count);

    console.log("Classes:", classes);
    console.log("Counts:", counts);

    // Chart dimensions and margins
    const margin = { top: 20, right: 20, bottom: 200, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define x and y scales
    const x = d3.scaleBand()
        .domain(classes)
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(counts)])
        .nice()
        .range([height, 0]);

    // Tooltip setup
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
        .style("font-size", "12px");

    // Add bars to the chart
    svg.selectAll(".bar")
        .data(sortedClasses)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.shipClass))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "steelblue")
        .on("mouseover", function (event, d) {
            // Show tooltip on hover
            tooltip.style("visibility", "visible")
                .text(`${d.shipClass}: ${d.count}`);
            d3.select(this).attr("fill", "yellow");
        })
        .on("mousemove", function (event) {
            // Move tooltip with the mouse
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip and reset bar color
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill", "steelblue");
        });

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Top 20 Ship Classes by Ship Count");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 150)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Ship Class");

    // Add y-axis label
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Number of Ships");
}
