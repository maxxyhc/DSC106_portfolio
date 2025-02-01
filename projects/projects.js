import { fetchJSON, renderProjects } from "../global.js";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const a = document.querySelectorAll('article');
const projectsTitle = document.querySelector('h1');
projectsTitle.textContent = `${projects.length} Projects`;
