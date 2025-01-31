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
  