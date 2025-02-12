import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projectsData = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('h1');
const searchInput = document.querySelector('.searchBar');

projectsTitle.textContent = `${projectsData.length} Projects`;

// State variables
let selectedIndex = -1;
let query = '';

// Dynamically detect base path
const isGitHubPages = window.location.hostname.includes('github.io');
const basePath = isGitHubPages ? '/DSC106_portfolio/' : '/';

// Initial rendering
renderProjects(projectsData, projectsContainer, 'h2');
renderPieChart(projectsData);

// Core function to render the pie chart
function renderPieChart(projectsGiven) {
    // Clear existing pie chart and legend to avoid duplicates
    const svgContainer = d3.select('#projects-pie-plot');
    svgContainer.selectAll('*').remove();  // Clear SVG content
    d3.select('.legend').selectAll('li').remove();  // Clear legend items

    const rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,  // Count projects per year
        (d) => d.year     // Group by year
    );

    const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

    // SVG setup
    const containerWidth = svgContainer.node().getBoundingClientRect().width;
    const outerRadius = containerWidth / 2;

    const svg = svgContainer
        .attr('width', containerWidth)
        .attr('height', containerWidth)
        .attr('viewBox', `0 0 ${containerWidth} ${containerWidth}`)
        .append('g')
        .attr('transform', `translate(${containerWidth / 2}, ${containerWidth / 2})`);

    // Pie chart setup
    const sliceGenerator = d3.pie().value((d) => d.value);
    const arcData = sliceGenerator(data);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(outerRadius);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Render pie slices
    arcData.forEach((d, idx) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                updateSelection(arcData);  // Do NOT re-render pie chart
            });
    });

    // Render legend
    const legend = d3.select('.legend');
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('class', idx === selectedIndex ? 'selected' : '')
            .html(`
                <span class="swatch" style="background-color: ${colors(idx)};"></span> 
                ${d.label} <em>(${d.value})</em>
            `)
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                updateSelection(arcData);  // Do NOT re-render pie chart
            });
    });
}

// Handle updates to both pie slices and project rendering
function updateSelection(arcData) {
    d3.selectAll('#projects-pie-plot path')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

    d3.selectAll('.legend li')
        .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

    // Filter projects by selected year and search query
    let filteredProjects = projectsData.filter((project) => {
        const projectMatchesQuery = Object.values(project).join('\n').toLowerCase().includes(query);

        if (selectedIndex === -1) {
            return projectMatchesQuery;  // No slice selected, just apply search
        }

        const selectedYear = arcData[selectedIndex].data.label;
        return project.year === selectedYear && projectMatchesQuery;
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
}

// Search input handler
searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    const filteredProjects = projectsData.filter((project) => {
        return Object.values(project).join('\n').toLowerCase().includes(query);
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);  // Only update pie chart when search is used
});
