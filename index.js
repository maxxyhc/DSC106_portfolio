import { fetchJSON, renderProjects,fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

// Render projects
renderProjects(latestProjects, projectsContainer, 'h2');
// Fetch and log GitHub data
//why use await? Network requests take time, and 
//using await ensures that your code doesn’t move forward until the response comes back.
const githubData = await fetchGitHubData('giorgianicolaou');
console.log(githubData);


const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }