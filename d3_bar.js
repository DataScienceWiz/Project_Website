// TO IMPLEMENT ADD <div id="barplot"></div>

const width = 800;
const panelHeight = 250;
const margin = {top: 55, right: 90, bottom: 50, left: 60};
const colors = ["#FDFF7C", "#8f0000"];

const svg = d3.select('#barplot')
              .append('svg')
              .attr('width', width)
              .attr('height', panelHeight*2 + margin.top + margin.bottom)
              .style('background', 'white');

svg.append("rect")
   .attr("x", 0)
   .attr("y", 0)
   .attr("width", width)
   .attr("height", panelHeight*2 + margin.top + margin.bottom)
   .attr("fill", "none")      
   .attr("stroke", "black")  
   .attr("stroke-width", 2); 

svg.append("text")
   .attr("x", width/2)
   .attr("y", 30) 
   .attr("text-anchor", "middle")
   .style("font-family", "Segoe UI")
   .style("font-size", "18px")
   .style("font-weight", "bold")
   .text("Comparing Average Headways by Stop: Most Improved → Least Improved");

function drawPanel(data, yOffset, title, weekLabels, showXAxis=false) {
    data.forEach(d => {
        d.week1 = +d.week1;
        d.week2 = +d.week2;
        d.improvement = +d.improvement;
    });
    data.sort((a,b) => d3.descending(a.improvement, b.improvement));

    const x0 = d3.scaleBand()
                 .domain(data.map(d => d.stop_name))
                 .range([margin.left, width - margin.right])
                 .padding(0.2);

    const x1 = d3.scaleBand()
                 .domain(['week1','week2'])
                 .range([0, x0.bandwidth()])
                 .padding(0.05);

    const yMax = d3.max(data, d => Math.max(d.week1, d.week2));
    const y = d3.scaleLinear()
                .domain([0, yMax])
                .range([yOffset + panelHeight - margin.bottom, yOffset + margin.top]);

    svg.append('text')
    .attr('x', 0 - panelHeight/2 - yOffset - 5)
    .attr('y', 25)
    .text('Average Headway (seconds)')
    .style("font-size", "12px")
    .style("font-family", "Segoe UI")
    .style('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')

    const barGroups = svg.selectAll(`.barGroup-${title}`)
                         .data(data)
                         .enter()
                         .append("g")
                         .attr("transform", d => `translate(${x0(d.stop_name)},0)`);

    ['week1','week2'].forEach((week,i) => {
        barGroups.append("rect")
                 .attr("x", d => x1(week))
                 .attr("y", d => y(d[week]))
                 .attr("width", x1.bandwidth())
                 .attr("height", d => yOffset + panelHeight - margin.bottom - y(d[week]))
                 .attr("fill", colors[i])
                 .attr("stroke", "black")
                 .attr("opacity", 0.8);
    });

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y).tickValues(d3.range(0, yMax, 100))); 

    svg.append("text")
       .attr("x", width/2)
       .attr("y", yOffset + margin.top/2+10)
       .attr("text-anchor", "middle")
       .style("font-family", "Segoe UI")
       .style("font-size", "14px")
       .style("font-weight", "bold")
       .text(title);

    if(showXAxis){
        svg.append("g")
           .attr("transform", `translate(0,${yOffset + panelHeight - margin.bottom})`)
           .call(d3.axisBottom(x0))
           .selectAll("text")
           .attr("transform", "rotate(45)")
           .style("text-anchor", "start")
           .style("font-family", "Segoe UI")
           .style("font-size", "12px");
    }
}

Promise.all([
    d3.csv('wd_comparison_df.csv'),
    d3.csv('we_comparison_df.csv')
]).then(([wdData, weData]) => {
    drawPanel(wdData, 20, 'Weekdays', ['Week 1', 'Week 2'], true);
    drawPanel(weData, panelHeight+50, 'Weekends', ['Week 1', 'Week 2'], true);
});

const weekLabels = ['Week 1', 'Week 2'];
const legendX = width - margin.right + 10;
const legendY = margin.top;
const legendItemHeight = 20;
const legendWidth = 80;
const legendHeight = weekLabels.length * legendItemHeight;

svg.append("rect")
   .attr("x", legendX - 10) 
   .attr("y", legendY - 5)
   .attr("width", legendWidth)
   .attr("height", legendHeight + 5)
   .attr("fill", "white")   
   .attr("stroke", "black")
   .attr("stroke-width", 1);

const legend = svg.append("g")
  .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

weekLabels.forEach((label, i) => {
    legend.append('rect')
          .attr('x', 0)
          .attr('y', i * 20)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', colors[i]);

    legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 8)
          .text(label)
          .attr("alignment-baseline", "middle")
          .style("font-family", "Segoe UI")
          .style("font-size", "12px");
});