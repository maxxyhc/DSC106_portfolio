console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// //get an array of all a elements inside nav
// const navLinks = $$("nav a");

// // find the link that matches the current pages's url
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
// // ?. checking if currentLink exists before trying to access .classList.add('current')
// currentLink?.classList.add('current');

let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'https://github.com/maxxyhc', title: 'GitHub'}
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

//detect if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('Home');

// Loop through the pages array and add links to the <nav>
for(let p of pages){
    let url = p.url;
    let title = p.title;

    // if not on the home page, fix it
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
      );
    
    // Open external links in a new tab
    if (a.host !== location.host) {
    a.target = "_blank";
    }
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-switcher">
        <option value="auto">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  

const themeSwitcher = document.getElementById('theme-switcher');

themeSwitcher.addEventListener('change', (event) => {
const selectedTheme = event.target.value;
document.documentElement.setAttribute('data-theme', selectedTheme);
localStorage.setItem('theme', selectedTheme);
});

// Load the saved theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'auto';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitcher.value = savedTheme;


//lab4 step 1.2
// Importing Project Data into the Projects Page
export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      // throw an error if the fetch request is not successful
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      console.log(response)

      const data = await response.json();
      return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

// const test = await fetchJSON('../lib/projects.json');
// console.log(test);

//lab step 1.3
export function renderProjects(project, containerElement, headingLevel = 'h2') {
  //  Validate containerElement
  if(!containerElement || !(containerElement instanceof HTMLElement)){
    console.error('Invalid container element.');
    return;
  }

  // Validate if the project parameter is an array
  if (!Array.isArray(project)) {
    console.error('Invalid project data: Expected an array.');
    return;
  }
  
  //Clear the container before rendering new content
  containerElement.innerHTML = '';
  for (let pro of project){
    const article = document.createElement('article');

  //Defining the Content Dynamically
    article.innerHTML = `
    <div class="project-content">
      <${headingLevel} class="project-title">${pro.title}</${headingLevel}>
      <img src="${pro.image}" alt="${pro.title}" class="project-image">
      <p class="project-description">${pro.description}</p>
      <div class="project-year">© ${pro.year}</div>
    </div>
    `;
    containerElement.appendChild(article);
  }
}

// const a = document.querySelector('.projects');
// const test2 = renderProjects(test, a, 'h3');
// console.log('Rendered articles:', test2);

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}