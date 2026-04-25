/* ============================================================
   MATTHEW PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ===== CUSTOM CURSOR ===== */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX  = 0, trailY  = 0;
let raf;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function tickTrail() {
  trailX += (mouseX - trailX) * 0.1;
  trailY += (mouseY - trailY) * 0.1;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  raf = requestAnimationFrame(tickTrail);
}
tickTrail();

document.querySelectorAll('a, button, .project-card, .hobby-card, .social-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    cursorTrail.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    cursorTrail.classList.remove('hovered');
  });
});

if ('ontouchstart' in window) {
  cursor.style.display      = 'none';
  cursorTrail.style.display = 'none';
  document.body.style.cursor = 'auto';
}

/* ===== STAR CANVAS ===== */
const canvas = document.getElementById('starCanvas');
const ctx    = canvas.getContext('2d');
let stars    = [];
let shooters = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  buildStars();
}

function buildStars() {
  stars = [];
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 5800), 280);
  for (let i = 0; i < count; i++) {
    stars.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.4 + 0.2,
      base:  Math.random() * 0.75 + 0.2,
      speed: Math.random() * 0.04 + 0.01,
      phase: Math.random() * Math.PI * 2,
      freq:  Math.random() * 0.018 + 0.006,
      drift: (Math.random() - 0.5) * 0.04,
    });
  }
}

function spawnShooter() {
  shooters.push({
    x:    Math.random() * canvas.width * 0.65,
    y:    Math.random() * canvas.height * 0.45,
    vx:   9 + Math.random() * 7,
    vy:   6 + Math.random() * 5,
    len:  90  + Math.random() * 90,
    op:   1,
    fade: 0.016 + Math.random() * 0.01,
  });
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Nebula blobs */
  const blobs = [
    { cx: canvas.width * 0.22, cy: canvas.height * 0.38, r: canvas.width * 0.42, color: 'rgba(123,47,247,0.038)' },
    { cx: canvas.width * 0.78, cy: canvas.height * 0.62, r: canvas.width * 0.36, color: 'rgba(0,212,255,0.024)' },
    { cx: canvas.width * 0.5,  cy: canvas.height * 0.9,  r: canvas.width * 0.28, color: 'rgba(123,47,247,0.022)' },
  ];
  blobs.forEach(b => {
    const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
    g.addColorStop(0, b.color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  /* Stars */
  stars.forEach(s => {
    s.phase += s.freq;
    s.x     += s.drift;
    s.y     -= s.speed;

    if (s.y < -2)             { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
    if (s.x < -2)             { s.x = canvas.width + 2; }
    if (s.x > canvas.width+2) { s.x = -2; }

    const twinkle = 0.55 + 0.45 * Math.sin(s.phase);
    const op      = s.base * twinkle;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${op})`;
    ctx.fill();

    if (s.r > 1.1) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,180,255,${op * 0.12})`;
      ctx.fill();
    }
  });

  /* Shooting stars */
  shooters = shooters.filter(ss => ss.op > 0);
  shooters.forEach(ss => {
    const nx = ss.x - ss.vx * (ss.len / ss.vx);
    const ny = ss.y - ss.vy * (ss.len / ss.vy);

    const g = ctx.createLinearGradient(ss.x, ss.y, nx, ny);
    g.addColorStop(0, `rgba(255,255,255,${ss.op})`);
    g.addColorStop(0.4, `rgba(160,180,255,${ss.op * 0.5})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = g;
    ctx.lineWidth   = 1.6;
    ctx.stroke();

    ss.x  += ss.vx;
    ss.y  += ss.vy;
    ss.op -= ss.fade;
  });

  requestAnimationFrame(drawFrame);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawFrame();

/* Stagger shooting stars */
function scheduleShooter() {
  spawnShooter();
  setTimeout(scheduleShooter, 2800 + Math.random() * 3500);
}
setTimeout(scheduleShooter, 1200);

/* ===== TYPING EFFECT ===== */
const typedEl = document.getElementById('typedText');
const phrases = [
  'Hi, my name is Matthew',
  'I build my future in tech',
  'Information & Networking Technologies student',
  'I love to vibe code',
  'Exploring the universe & code',
];

let pIdx    = 0;
let cIdx    = 0;
let delMode = false;

function tick() {
  const phrase = phrases[pIdx];

  if (!delMode) {
    cIdx++;
    typedEl.textContent = phrase.slice(0, cIdx);
    if (cIdx === phrase.length) {
      delMode = true;
      setTimeout(tick, 1900);
      return;
    }
    setTimeout(tick, 75 + Math.random() * 30);
  } else {
    cIdx--;
    typedEl.textContent = phrase.slice(0, cIdx);
    if (cIdx === 0) {
      delMode = false;
      pIdx    = (pIdx + 1) % phrases.length;
      setTimeout(tick, 420);
      return;
    }
    setTimeout(tick, 42 + Math.random() * 18);
  }
}

setTimeout(tick, 1100);

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ===== MOBILE MENU ===== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu    = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  mobileMenuBtn.querySelector('i').className =
    mobileMenu.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
  });
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== PROGRESS BARS ===== */
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill  = entry.target.querySelector('.progress-fill');
    const label = entry.target.querySelector('.progress-label');
    if (fill) {
      setTimeout(() => {
        fill.style.width = fill.dataset.width + '%';
      }, 200);
    }
    progressObserver.unobserve(entry.target);
  });
}, { threshold: 0.45 });

document.querySelectorAll('.timeline-item').forEach(el => progressObserver.observe(el));

/* ===== COUNTER ANIMATION ===== */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    if (isNaN(target)) return;

    let current  = 0;
    const frames = 50;
    const step   = target / frames;
    const id     = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + suffix;
      if (current >= target) clearInterval(id);
    }, 28);

    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

/* ===== LEARNING BADGE ===== */
setTimeout(() => {
  const badge = document.getElementById('learningBadge');
  if (badge) badge.classList.add('show');
}, 2600);

/* ===== CARD HOVER PARALLAX ===== */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const cy    = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    card.style.transform = `translateY(-10px) rotateX(${-cy * 4}deg) rotateY(${cx * 4}deg)`;
    card.style.transition = 'transform .08s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1), border-color .4s, box-shadow .4s';
  });
});

/* ===== SECTION ACTIVE NAV HIGHLIGHT ===== */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navAnchors.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--cyan)' : '';
    });
  });
}, { threshold: 0.45 });

sections.forEach(s => sectionObserver.observe(s));

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contactForm');
const sendBtn     = document.getElementById('sendBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    sendBtn.disabled = true;
    sendBtn.querySelector('.btn-send-text').textContent = 'Sending…';

    try {
      const data = Object.fromEntries(new FormData(contactForm));
      const res = await fetch('https://formspree.io/f/xwvazewa', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        contactForm.reset();
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 5000);
      } else {
        alert('Something went wrong. Please email me directly.');
      }
    } catch {
      alert('Network error. Please email me directly.');
    }

    sendBtn.disabled = false;
    sendBtn.querySelector('.btn-send-text').textContent = 'Send Message';
  });
}

/* ===== CURSOR HOVER — include contact elements ===== */
document.querySelectorAll('.btn-resume, .btn-send, .contact-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    cursorTrail.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    cursorTrail.classList.remove('hovered');
  });
});
