// Page controls work independently of the navigation effect.
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
});
const cards = [...document.querySelectorAll('.event-card, .programme-ticket')];
const filters = { category: 'all', day: 'all' };
let savedOnly = false;
let savedPicks = new Set();
try {
  const stored = JSON.parse(localStorage.getItem('astra-event-picks') || '[]');
  const validIds = new Set((window.astraEvents || []).map(event => event.id));
  if (Array.isArray(stored)) savedPicks = new Set(stored.filter(id => validIds.has(id)));
} catch {}
function updatePicks() {
  document.querySelectorAll('[data-save]').forEach(button => {
    const saved = savedPicks.has(button.dataset.save);
    const event = (window.astraEvents || []).find(item => item.id === button.dataset.save);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + (event?.title || 'event') + (saved ? ' from My picks' : ''));
  });
  const count = document.querySelector('#saved-count');
  if (count) count.textContent = savedPicks.size;
}
document.querySelectorAll('[data-save]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.save;
    if (savedPicks.has(id)) savedPicks.delete(id); else savedPicks.add(id);
    try { localStorage.setItem('astra-event-picks', JSON.stringify([...savedPicks])); } catch {}
    updatePicks();
    const status = document.querySelector('#picks-status');
    const event = (window.astraEvents || []).find(item => item.id === id);
    if (status) status.textContent = event.title + (savedPicks.has(id) ? ' saved to My picks.' : ' removed from My picks.');
    if (savedOnly) {
      filterEvents(false);
      if (!savedPicks.has(id)) document.querySelector('#saved-events').focus();
    }
  });
});
document.querySelector('#saved-events')?.addEventListener('click', event => {
  savedOnly = !savedOnly;
  event.currentTarget.setAttribute('aria-pressed', String(savedOnly));
  filterEvents();
});
function filterEvents(animateCards = true) {
  const query = (document.querySelector('#event-search')?.value || '').trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const show = Object.entries(filters).every(([key, value]) => value === 'all' || card.dataset[key] === value)
      && (card.dataset.search || card.textContent).toLowerCase().includes(query)
      && (!savedOnly || savedPicks.has(card.dataset.id));
    card.hidden = !show;
    if (show) {
      visible++;
      if (animateCards && motionMode === 'full') {
        card.animate?.([{ opacity: .2, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
      }
    }
  });
  const count = document.querySelector('#event-count');
  if (count) count.textContent = visible + ' event' + (visible === 1 ? '' : 's') + ' to explore';
  const empty = document.querySelector('#no-events');
  if (empty) {
    empty.hidden = visible !== 0;
    if (empty.querySelector('h2')) {
      const noPicks = savedOnly && savedPicks.size === 0;
      empty.querySelector('h2').textContent = noPicks ? 'Your constellation starts here.' : 'A little too far off-orbit.';
      empty.querySelector('p').textContent = noPicks ? 'Save an event with the bookmark button, then find it here whenever you like.' : 'No events match this selection. Try another search or reset your filters.';
    }
  }
  document.querySelectorAll('[data-event-day]').forEach(group => {
    const matches = [...group.querySelectorAll('.programme-ticket')].filter(card => !card.hidden).length;
    group.hidden = matches === 0;
    group.querySelector('.day-result-count').textContent = matches + ' event' + (matches === 1 ? '' : 's');
  });
}
document.querySelector('#event-search')?.addEventListener('input', filterEvents);
function resetEvents() {
  filters.category = filters.day = 'all';
  savedOnly = false;
  document.querySelector('#saved-events')?.setAttribute('aria-pressed', 'false');
  document.querySelector('#event-search').value = '';
  document.querySelectorAll('[data-filter-group] button').forEach(button => {
    const active = button.dataset.filter === 'all';
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  filterEvents();
}
document.querySelector('#reset-events')?.addEventListener('click', resetEvents);
document.querySelectorAll('[data-reset-events]').forEach(button => button.addEventListener('click', resetEvents));
document.querySelectorAll('[data-filter-group]').forEach(group => {
  group.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      filters[group.dataset.filterGroup] = button.dataset.filter;
      group.querySelectorAll('button').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      filterEvents();
    });
  });
});
document.querySelectorAll('[data-schedule]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-schedule]').forEach(item => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', String(item === tab));
    });
    document.querySelectorAll('.schedule-panel').forEach(panel => {
      panel.hidden = panel.id !== tab.dataset.schedule;
    });
  });
});
const form = document.querySelector('#registration-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.querySelector('#name');
  const email = form.querySelector('#email');
  const nameError = form.querySelector('#name-error');
  const emailError = form.querySelector('#email-error');
  const status = form.querySelector('#form-status');
  nameError.textContent = name.value.trim() ? '' : 'Please enter your name.';
  emailError.textContent = email.validity.valid ? '' : 'Enter a valid email address.';
  name.setAttribute('aria-invalid', String(Boolean(nameError.textContent)));
  email.setAttribute('aria-invalid', String(Boolean(emailError.textContent)));
  if (nameError.textContent || emailError.textContent) {
    status.textContent = '';
    (nameError.textContent ? name : email).focus();
    return;
  }
  status.textContent = 'Thanks, ' + name.value.trim() + '. Your demo RSVP is confirmed on this device.';
  form.reset();
});

const field = document.createElement('div');
field.className = 'planet-field';
field.setAttribute('aria-hidden', 'true');
field.innerHTML = '<span class="planet planet-a"></span><span class="planet planet-b"></span>';
document.body.prepend(field);

// Drive the transition through the browser animation API, and await completion.
// A subtle fade still runs when reduced motion is enabled.
const overlay = document.createElement('div');
overlay.className = 'page-transition';
overlay.setAttribute('aria-hidden', 'true');
overlay.innerHTML = '<div class="transition-glow"></div><div class="transition-planet"></div><span class="transition-caption">Entering orbit</span>';
document.body.append(overlay);
// Full motion is the requested default. The Calm option remains available.
let motionMode = 'full';
try { motionMode = localStorage.getItem('astra-motion-v2') || 'full'; } catch {}
const motionControl = document.createElement('button');
motionControl.type = 'button';
motionControl.className = 'motion-control';
function updateMotion() {
  motionControl.textContent = 'Motion: ' + (motionMode === 'full' ? 'Full' : 'Calm');
  motionControl.setAttribute('aria-label', 'Motion is ' + motionMode + '. Switch to ' + (motionMode === 'full' ? 'calm' : 'full') + ' animation');
  document.body.classList.toggle('calm-motion', motionMode === 'calm');
  requestAnimationFrame(updateStory);
}
motionControl.addEventListener('click', () => {
  motionMode = motionMode === 'full' ? 'calm' : 'full';
  try { localStorage.setItem('astra-motion-v2', motionMode); } catch {}
  updateMotion();
});
document.querySelector('.site-footer')?.append(motionControl);
updateMotion();
let navigating = false;
function resetTravel() {
  navigating = false;
  overlay.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel());
  overlay.classList.remove('is-active');
  overlay.style.opacity = '';
}
window.addEventListener('pageshow', resetTravel);

function animateElement(element, frames, options) {
  if (!element.animate) return new Promise(resolve => setTimeout(resolve, options.duration));
  return element.animate(frames, { ...options, fill: 'forwards' }).finished.catch(() => {});
}
document.addEventListener('click', async event => {
  const link = event.target.closest?.('a[href]');
  if (!link || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href, location.href);
  const current = new URL(location.href);
  if (destination.origin !== current.origin || !destination.pathname.endsWith('.html') || destination.pathname === current.pathname) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  overlay.classList.add('is-active');
  const reduced = motionMode !== 'full';
  const sphere = overlay.querySelector('.transition-planet');
  const caption = overlay.querySelector('.transition-caption');
  const duration = reduced ? 420 : 1100;
  try {
    await Promise.race([
      Promise.all([
        animateElement(overlay, [{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: 1 }], { duration, easing: 'ease-out' }),
        animateElement(sphere, reduced
          ? [{ opacity: 0 }, { opacity: 0 }]
          : [{ transform: 'scale(.35)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: .45 }, { transform: 'scale(4.5)', opacity: 1 }],
          { duration, easing: 'cubic-bezier(.55,0,.3,1)' }),
        animateElement(caption, [{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration, easing: 'ease-in-out' })
      ]),
      new Promise(resolve => setTimeout(resolve, duration + 350))
    ]);
    try { sessionStorage.setItem('astra-arrival', destination.pathname); } catch {}
    location.assign(destination.href);
  } catch {
    location.assign(destination.href);
  }
});
try {
  if (sessionStorage.getItem('astra-arrival') === location.pathname) {
    sessionStorage.removeItem('astra-arrival');
    const main = document.querySelector('main');
    if (main?.animate) main.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
  }
} catch {}

// Calendar and daily event board share the same source as the programme.
const eventData = window.astraEvents || [];
const calendarGrid = document.querySelector('#calendar-grid');
let calendarMonth = new Date(2026, 10, 1);
let selectedDate = '2026-11-03';
function isoDate(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function renderAgenda() {
  const chosen = new Date(selectedDate + 'T12:00:00');
  const dailyEvents = eventData.filter(event => event.date === selectedDate);
  document.querySelector('#agenda-heading').textContent = chosen.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  document.querySelector('#agenda-count').textContent = dailyEvents.length ? dailyEvents.length + ' events, one great day' : 'A little breathing room';
  const board = document.querySelector('#agenda-grid');
  board.innerHTML = dailyEvents.length ? dailyEvents.map((event, index) => `<article class="diary-event tone-${event.tone}"><div class="diary-event-top"><span>${event.category}</span><span>0${index + 1}</span></div><time>${event.time}</time><h3>${event.title}</h3><p>${event.note}</p><div class="diary-event-bottom"><span>${event.venue}</span><a href="register.html" aria-label="Register for ${event.title}">Join ↗</a></div></article>`).join('') : '<div class="glass empty-events"><h3>Nothing scheduled here.</h3><p>The festival happens on 3 and 4 November. Pick a highlighted day to see the programme.</p></div>';
  if (motionMode === 'full') board.querySelectorAll('article').forEach((card, index) => {
    card.animate?.([{ opacity: .15, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 550, delay: index * 70, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
}
function renderCalendar() {
  if (!calendarGrid) return;
  document.querySelector('#calendar-month').textContent = calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  calendarGrid.innerHTML = '<span class="calendar-blank" aria-hidden="true"></span>'.repeat(offset);
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day), iso = isoDate(date);
    const events = eventData.filter(event => event.date === iso);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day' + (events.length ? ' has-events' : '') + (iso === selectedDate ? ' selected' : '');
    button.setAttribute('aria-pressed', String(iso === selectedDate));
    button.setAttribute('aria-label', date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + events.length + ' events');
    button.innerHTML = '<span>' + day + '</span>' + (events.length ? '<span class="day-dots" aria-hidden="true"><i></i><i></i><i></i></span>' : '');
    button.addEventListener('click', () => {
      selectedDate = iso; renderCalendar(); renderAgenda();
      calendarGrid.querySelector('.selected')?.focus({ preventScroll: true });
    });
    calendarGrid.append(button);
  }
}
if (calendarGrid) {
  document.querySelector('#previous-month').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() - 1); renderCalendar(); });
  document.querySelector('#next-month').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() + 1); renderCalendar(); });
  document.querySelector('#festival-month').addEventListener('click', () => { calendarMonth = new Date(2026, 10, 1); selectedDate = '2026-11-03'; renderCalendar(); renderAgenda(); });
  renderCalendar();
  renderAgenda();
}

// Reveal content when it enters the viewport, without making the initial page blank.
const revealTargets = document.querySelectorAll('.hero h1, .hero .lead, .actions, .festival-meta, .home-preview > *, .feature, .page-intro > *, .filter-panel, .event-card, .calendar-card, .diary-note, .agenda-heading, .diary-event, .about-statement, .values-grid article, .register-card > *, .programme-intro > *, .explorer-filter, .programme-ticket');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.dataset.revealed = 'true';
      if (motionMode !== 'full') return;
      const siblings = [...entry.target.parentElement.children];
      const delay = Math.min(siblings.indexOf(entry.target) * 65, 195);
      entry.target.animate?.([
        { opacity: .15, transform: 'translateY(32px)', filter: 'blur(5px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
      ], { duration: 850, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
  }, { threshold: .12 });
  revealTargets.forEach(target => observer.observe(target));
}
let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame || motionMode !== 'full') return;
  scrollFrame = requestAnimationFrame(() => {
    const core = document.querySelector('.orbital-core');
    if (core) core.style.translate = '0 ' + Math.min(scrollY * .045, 28) + 'px';
    updateStory();
    scrollFrame = 0;
  });
}, { passive: true });

// The sticky scene is scrubbed by scroll distance, never a timed carousel.
const story = document.querySelector('.scroll-story');
function updateStory() {
  if (!story || motionMode !== 'full') return;
  const bounds = story.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - viewport)));
  const position = progress * 2;
  const panels = [...story.querySelectorAll('.story-card')];
  panels.forEach((panel, index) => {
    const distance = index - position;
    const width = panel.offsetWidth;
    const scale = 1 - Math.min(Math.abs(distance), 1) * .1;
    panel.style.transform = 'translate(-50%, -50%) translateX(' + (distance * (width + 38)) + 'px) scale(' + scale + ') rotateY(' + (-distance * 5) + 'deg)';
    panel.style.opacity = String(Math.max(.2, 1 - Math.abs(distance) * .4));
    panel.style.zIndex = String(10 - Math.round(Math.abs(distance) * 3));
  });
  story.querySelectorAll('.story-chapters span').forEach((chapter, index) => {
    const active = index === Math.round(position);
    chapter.classList.toggle('active', active);
    if (active) chapter.setAttribute('aria-current', 'step'); else chapter.removeAttribute('aria-current');
  });
  story.querySelector('.story-progress i').style.transform = 'scaleX(' + progress + ')';
  story.querySelector('.story-halo').style.opacity = String(.6 + Math.sin(progress * Math.PI) * .4);
  story.querySelectorAll('.design-object').forEach((object, index) => {
    object.style.rotate = (Math.sin(progress * Math.PI) * (index - 1) * 14) + 'deg';
  });
  story.querySelectorAll('.sound-bars i').forEach((bar, index) => {
    bar.style.transform = 'scaleY(' + (.65 + Math.sin(position * 8 + index * .6) * .3) + ')';
  });
}
window.addEventListener('resize', updateStory);
updateStory();
updatePicks();
if (cards.length) filterEvents(false);
