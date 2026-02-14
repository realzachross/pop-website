// --- Nav scroll effect ---
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// --- Mobile toggle ---
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
if (toggle) {
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '\u2715' : '\u2630';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '\u2630';
    });
  });
}

// --- Scroll reveal ---
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
reveals.forEach(el => observer.observe(el));

// --- Spawn floating bubbles around whale ---
const whaleContainer = document.querySelector('.whale-container');
if (whaleContainer) {
  function spawnBubble() {
    const b = document.createElement('div');
    b.classList.add('bubble-particle');
    const size = 6 + Math.random() * 14;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = 20 + Math.random() * 60 + '%';
    b.style.bottom = '10%';
    b.style.animationDuration = 3 + Math.random() * 4 + 's';
    whaleContainer.appendChild(b);
    setTimeout(() => b.remove(), 7000);
  }

  setInterval(spawnBubble, 600);
}
