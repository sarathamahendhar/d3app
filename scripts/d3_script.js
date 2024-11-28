import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { histogram } from './histogram.js';
import { processShipData, renderChart } from "./utils.js";
import { createRankChart } from "./rank.js"
import {createScatterPlot} from "./scatter.js"

d3.json("scripts/data/ships.json").then(function(data) {

    const jpShips = data.filter(d => d.Country === "Japan");
    const usShips = data.filter(d => d.Country === "United States");

    //Task -1
    histogram(jpShips, "#histograms", "Japanese Ships");
    histogram(usShips, "#histograms", "US Ships");

    // Task -2
    const stats = processShipData(data);
    console.log(stats)
    renderChart("#chart",stats);

    // Task -3
    createRankChart(data, "#chart2");

    // Task -4
    createScatterPlot(data, "#chart3");

}).catch(function(error) {
    console.error("Error loading the JSON file:", error);
});
