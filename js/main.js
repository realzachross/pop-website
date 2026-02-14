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
  { threshold: 0.12 }
);
reveals.forEach(el => observer.observe(el));

// --- Spawn floating bubbles around whale ---
const whaleContainer = document.querySelector('.whale-container');
if (whaleContainer) {
  function spawnBubble() {
    const b = document.createElement('div');
    b.classList.add('bubble-particle');
    const size = 4 + Math.random() * 10;
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = 25 + Math.random() * 50 + '%';
    b.style.bottom = 15 + Math.random() * 20 + '%';
    b.style.animationDuration = 4 + Math.random() * 4 + 's';
    whaleContainer.appendChild(b);
    setTimeout(() => b.remove(), 8000);
  }

  setInterval(spawnBubble, 900);
}
