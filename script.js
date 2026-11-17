/* =========================================================
   Portfolio interactions. Everything is wrapped in one
   DOMContentLoaded handler, with no external dependencies.
   ========================================================= */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Toast helper ----------
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // ---------- Footer year ----------
  $('#year').textContent = new Date().getFullYear();

  // ---------- Placeholder links ([Add GitHub URL] etc.) ----------
  // These do nothing until you replace href="#" and remove class="todo".
  $$('a.todo').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    showToast('Placeholder link: add your real URL in index.html.');
  }));

  // ---------- Mobile menu ----------
  const burger = $('#burger');
  const menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ---------- Navbar background + back-to-top visibility ----------
  const nav = $('#nav');
  const topBtn = $('#top');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    topBtn.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---------- Scroll reveal ----------
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in')); // old browsers: just show everything
  }

  // ---------- Active nav link highlighting ----------
  const links = $$('.menu a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  function highlight() {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1];
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', highlight, { passive: true });
  highlight();

  // ---------- Contact form validation ----------
  const form = $('#form');
  const status = $('#status');
  const rules = {
    name:    v => v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.',
    subject: v => v.trim().length >= 3 ? '' : 'Enter a subject (at least 3 characters).',
    message: v => v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'
  };
  function check(id) {
    const input = $('#' + id);
    const msg = rules[id](input.value);
    $('#' + id + '-err').textContent = msg;
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    status.textContent = '';
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const firstBad = Object.keys(rules).find(id => !check(id));
      if (firstBad) $('#' + firstBad).focus();
      return;
    }
    // No backend: open the visitor's email app with the message filled in.
    // To get real delivery, replace this block with a fetch() to Formspree/Netlify Forms.
    const body = `From: ${$('#name').value.trim()} (${$('#email').value.trim()})\n\n${$('#message').value.trim()}`;
    const mailto = 'mailto:syedalifathiman.aiml2025@citchennai.net'
      + '?subject=' + encodeURIComponent($('#subject').value.trim())
      + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;
    status.textContent = 'Opening your email app. If nothing opens, email me directly at the address above.';
    form.reset();
  });
});
