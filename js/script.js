/* ============================================
   MirJournal Media — Gallery Logic
   ============================================ */

const DATA_URL = 'data/videos.json';

let siteData = null;
let activeFilter = 'all';

/* ---------- Utilities ---------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getCategory(catId) {
  return siteData.categories.find(c => c.id === catId) ||
         { id: 'all', label: '전체', color: '#FFFFFF' };
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isReady(value) {
  // returns false if value is empty or contains the REPLACE placeholder
  if (!value) return false;
  if (typeof value === 'string' && value.includes('REPLACE')) return false;
  return true;
}

/* ---------- Icons (inline SVG) ---------- */

const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1-1-1.8-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5C1.5 4.4.8 5.2.5 6.2 0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2.1 2.1 1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5c1.1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.3 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.3-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.3 2.2-.4 1.2-.1 1.6-.1 4.8-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2.3 5 .1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.2 2.1.5 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.5C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c1.3-.1 2.1-.2 2.9-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.5-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.2-2.1-.5-2.9-.3-.8-.7-1.5-1.4-2.2-.7-.7-1.4-1.1-2.2-1.4-.8-.3-1.6-.5-2.9-.5C15.7 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zM12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm6.4-11.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z"/></svg>',
  article: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
};

/* ---------- Renderers ---------- */

function renderMast() {
  const { site } = siteData;
  $('.mast__title').textContent = site.title;
  $('.mast__subtitle').textContent = site.subtitle;
}

function renderFilters() {
  const root = $('.filters');
  root.innerHTML = siteData.categories.map(cat => `
    <button class="filter-chip ${cat.id === activeFilter ? 'is-active' : ''}"
            data-filter="${cat.id}">${cat.label}</button>
  `).join('');

  $$('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderFilters();
      renderFeatured();
      renderGallery();
    });
  });
}

function renderFeatured() {
  const section = $('.featured');

  // Hide featured area when a specific category filter is active
  if (activeFilter !== 'all') {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  // Use the most recent published video that has a real embed id
  const playable = siteData.videos
    .filter(v => isReady(v.youtube_embed_id))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Fallback: most recent overall
  const featured = playable[0] || siteData.videos
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (!featured) return;

  const cat = getCategory(featured.category);
  const root = $('.featured__grid');

  root.innerHTML = `
    <div class="featured__media" data-video-id="${featured.id}">
      <img src="${escapeHtml(featured.thumbnail)}"
           alt="${escapeHtml(featured.title)}"
           onerror="this.style.display='none'">
      <div class="featured__play">${ICONS.play}</div>
    </div>
    <div class="featured__info">
      <span class="category-tag" style="color: ${cat.color}">${cat.label}</span>
      <h2 class="featured__title">${escapeHtml(featured.title)}</h2>
      <p class="featured__summary">${escapeHtml(featured.summary)}</p>
      <div class="featured__meta">
        <span>${formatDate(featured.date)}</span>
        ${featured.duration ? `<span>${featured.duration}</span>` : ''}
      </div>
    </div>
  `;

  root.querySelector('.featured__media').addEventListener('click', () => {
    openModal(featured.id);
  });
}

function renderGallery() {
  const root = $('.gallery__grid');
  const empty = $('.gallery__empty');
  const label = $('.gallery__label');

  const filtered = siteData.videos.filter(v => {
    if (activeFilter === 'all') return true;
    return v.category === activeFilter;
  });

  // Update label to reflect active filter
  if (activeFilter === 'all') {
    label.textContent = `— ALL EPISODES · ${siteData.videos.length}편`;
  } else {
    const cat = getCategory(activeFilter);
    label.textContent = `— ${cat.label.toUpperCase()} · ${filtered.length}편`;
  }

  if (filtered.length === 0) {
    root.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  root.innerHTML = filtered.map(v => {
    const cat = getCategory(v.category);
    const platforms = [];
    if (isReady(v.youtube_url)) platforms.push({ icon: ICONS.youtube, name: 'YouTube' });
    if (isReady(v.instagram_url)) platforms.push({ icon: ICONS.instagram, name: 'Instagram' });

    return `
      <article class="card" data-video-id="${v.id}">
        <div class="card__media">
          <img src="${escapeHtml(v.thumbnail)}"
               alt="${escapeHtml(v.title)}"
               onerror="this.style.display='none'">
          ${platforms.length ? `
            <div class="card__platforms">
              ${platforms.map(p => `<span class="card__platform" title="${p.name}">${p.icon}</span>`).join('')}
            </div>` : ''}
          ${v.duration ? `<span class="card__duration">${v.duration}</span>` : ''}
        </div>
        <span class="card__category" style="color: ${cat.color}">${cat.label}</span>
        <h3 class="card__title">${escapeHtml(v.title)}</h3>
        <time class="card__date">${formatDate(v.date)}</time>
      </article>
    `;
  }).join('');

  $$('.card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.videoId));
  });
}

/* ---------- Modal ---------- */

function openModal(videoId) {
  const v = siteData.videos.find(x => x.id === videoId);
  if (!v) return;

  const cat = getCategory(v.category);
  const modal = $('.modal');
  const panel = $('.modal__panel');

  // Embed body
  let embedHtml;
  if (isReady(v.youtube_embed_id)) {
    embedHtml = `
      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(v.youtube_embed_id)}?autoplay=1&rel=0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen></iframe>`;
  } else {
    embedHtml = `
      <div class="modal__pending">
        영상 준비 중
        <small>VIDEO COMING SOON</small>
      </div>`;
  }

  // Action buttons
  const actions = [];
  if (isReady(v.youtube_url)) {
    actions.push(`<a class="btn" href="${escapeHtml(v.youtube_url)}" target="_blank" rel="noopener">${ICONS.youtube} YouTube</a>`);
  }
  if (isReady(v.instagram_url)) {
    actions.push(`<a class="btn" href="${escapeHtml(v.instagram_url)}" target="_blank" rel="noopener">${ICONS.instagram} Instagram</a>`);
  }
  if (v.article_url) {
    actions.push(`<a class="btn btn--primary" href="${escapeHtml(v.article_url)}" target="_blank" rel="noopener">${ICONS.article} 본문 기사 읽기</a>`);
  }

  panel.innerHTML = `
    <button class="modal__close" aria-label="닫기">${ICONS.close}</button>
    <div class="modal__video">${embedHtml}</div>
    <div class="modal__info">
      <span class="modal__category" style="color: ${cat.color}">${cat.label}</span>
      <h2 class="modal__title">${escapeHtml(v.title)}</h2>
      <p class="modal__summary">${escapeHtml(v.summary)}</p>
      <div class="modal__meta">
        <span>${formatDate(v.date)}</span>
        ${v.duration ? `<span>${v.duration}</span>` : ''}
      </div>
      <div class="modal__actions">${actions.join('')}</div>
    </div>
  `;

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  panel.querySelector('.modal__close').addEventListener('click', closeModal);
}

function closeModal() {
  $('.modal').classList.remove('is-open');
  $('.modal__panel').innerHTML = '';
  document.body.style.overflow = '';
}

function setupModalDismiss() {
  $('.modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ---------- Boot ---------- */

async function init() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    siteData = await res.json();
  } catch (err) {
    console.error('Failed to load videos.json:', err);
    $('.gallery__grid').innerHTML = `
      <p style="color: var(--text-muted); padding: 2rem;">
        데이터 로드 실패. videos.json 경로를 확인하세요.
      </p>`;
    return;
  }

  renderMast();
  renderFilters();
  renderFeatured();
  renderGallery();
  setupModalDismiss();
}

document.addEventListener('DOMContentLoaded', init);
