import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let data = [];
let commits = [];
let brushSelection = null
let xScale, yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
      }));

    processCommits();
    displayStats();
    createScatterplot();
}


function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
  
        // What information should we return about this commit?
        let ret = {
          id: commit,
          url: 'https://github.com/YOUR_REPO/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: false, // Prevents cluttering console output
            writable: false,   // Makes it read-only
            configurable: false

          });
        
        return ret;
      });

    console.log(commits);
}

function displayStats() {
    // Process commits first
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats')

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    const uniqueFiles = new Set(data.map(d => d.file)).size;
    dl.append('dt').text('Total unique files');
    dl.append('dd').text(uniqueFiles);

    // Add maximum depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max depth');
    dl.append('dd').text(maxDepth);

    // Add longest line
    const longestLine = d3.max(data, d => d.length);
    dl.append('dt').text('Longest line');
    dl.append('dd').text(longestLine);
}
  
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    commits = d3.groups(data, (d) => d.commit); 
  
});

const width = 1000;
const height = 600;

function createScatterplot() {
    if (!commits.length) return;
    
    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    brushSelector(svg);

    const margin = { top: 10, right: 10, bottom: 20, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
      
    // Update scales with new ranges
    xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime)) // Get min/max date
        .range([usableArea.left, usableArea.right]) // Use adjusted area
        .nice();

    // Use adjusted area
    yScale = d3.scaleLinear()
        .domain([0, 24]) // 0 to 24 hours
        .range([usableArea.top, usableArea.bottom]); 

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

   // adjust these values based on your experimentation
    const rScale = d3
          .scaleSqrt() // square root
          .domain([minLines, maxLines])
          .range([2, 30]);
    
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
      
    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, '0')}:00`); // Format as "00:00"

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(sortedCommits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime)) // X position based on date
        .attr("cy", (d) => yScale(d.hourFrac)) // Y position based on time of day
        .attr("r", (d) => rScale(d.totalLines)) // Dynamic radius based on totalLines
        .attr("fill", "steelblue") // Dot color
        .style("fill-opacity", 0.5) // Add transparency for overlapping dots
        .on('mouseenter', function (event, commit) {
          d3.select(event.currentTarget).style('fill-opacity', 1); // Highlight dot on hover
          updateTooltipContent(commit);
          updateTooltipVisibility(true);

          d3.select('#commit-tooltip')
              .style('top', `${event.pageY + 10}px`)
              .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseleave', function(event) {

          d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore opacity
          updateTooltipContent({});
          updateTooltipVisibility(false);
        });

    
}

function brushSelector(svg) {
  // const svg = d3.select('svg');

  // d3.select(svg)
  //   .call(d3.brush())
  //   .on('start brush end', brushed);
  
  // // raise the dots and overlay so that they appear abpve the rest of the elements
  // d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  if (!svg) {
    console.error("Error: SVG is undefined in brushSelector!");
    return;
  }
  const brush = d3.brush()
        .on("start brush end", brushed);

  svg.append("g")
      .attr("class", "brush")
      .call(brush);

  svg.selectAll('.dots, .brush ~ *').raise();
}

function brushed(event) {
  if (!event.selection) {
    brushSelection = null;
  } else {
      brushSelection = event.selection;
  }

  console.log("Brush Selection:", brushSelection);

  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const [[xMin, yMin], [xMax, yMax]] = brushSelection;

  // const commitDate = new Date(commit.datetime);
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
}

function updateSelection() {
  d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCircles = d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d));

  //Extract the selected commits from the selected circles' data
  const selectedCommits = selectedCircles.data().filter(isCommitSelected);

  //Update the commit count in the UI
  const countElement = document.getElementById('selection-count');
  if (countElement) {
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  }
}


function updateLanguageBreakdown() {
  // Get selected circles (visually selected commits)
  const selectedCircles = d3.selectAll('circle').filter('.selected');

  // Extract the selected commits from the selected circles' data
  const selectedCommits = selectedCircles.data();
  

  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}



function updateTooltipContent(commit) {

  console.log("Hovered commit:", commit);

  const tooltip = document.getElementById('commit-tooltip'); 
  if (!tooltip) return;

  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    return;
  }

  tooltip.innerHTML = `
        <strong>Commit:</strong> <a href="${commit.url}" target="_blank">${commit.id}</a><br>
        <strong>Date:</strong> ${commit.datetime?.toLocaleString('en', { dateStyle: 'full' })}<br>
        <strong>Time:</strong> ${commit.time}<br>
        <strong>Author:</strong> ${commit.author}<br>
        <strong>Lines Edited:</strong> ${commit.totalLines}
    `;

  tooltip.style.display = 'block';
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

