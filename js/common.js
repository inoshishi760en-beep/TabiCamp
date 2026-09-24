function getRootPrefix() {
  return document.querySelector('meta[name="site-root"]')?.content ?? '';
}

async function loadComponent(elementId, file) {
  const target = document.getElementById(elementId);
  if (!target) return;
  const prefix = getRootPrefix();
  try {
    const response = await fetch(prefix + file + '?v=20260924');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error(`共通パーツを読み込めませんでした: ${file}`, error);
    target.innerHTML = elementId === 'header-placeholder'
      ? '<header class="site-header"><nav class="container header-inner" aria-label="メインナビゲーション"><a class="site-title" href="index.html">お湯キャン△</a><a href="categories.html">記事一覧</a><a href="about.html">このサイトについて</a></nav></header>'
      : '<footer class="site-footer"><div class="container"><p>お湯キャン△</p><a href="privacy.html">プライバシーポリシー</a></div></footer>';
  }
  target.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!/^(?:[a-z]+:|\/|#|\.\.\/)/i.test(href)) link.setAttribute('href', prefix + href);
  });
}

function setupNavigation() {
  const normalPath = path => path.replace(/index\.html$/, '').replace(/\/$/, '');
  document.querySelectorAll('.site-nav a:not(.nav-cta)').forEach(link => {
    if (normalPath(new URL(link.href).pathname) === normalPath(location.pathname)) {
      link.setAttribute('aria-current', 'page');
    }
  });
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) close();
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', close);
}

function setupGroupedListCollapse() {
  document.querySelectorAll('.categories-list .category-item').forEach((group, index) => {
    const list = group.querySelector('ul');
    if (!list) return;
    const items = [...list.children];
    if (items.length <= 5) return;
    list.id ||= `article-group-${index}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-toggle';
    button.setAttribute('aria-controls', list.id);
    const update = expanded => {
      items.forEach((item, i) => item.classList.toggle('is-collapsed', !expanded && i >= 5));
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? '折りたたむ' : `${items.length}件すべて表示`;
    };
    update(false);
    button.addEventListener('click', () => update(button.getAttribute('aria-expanded') !== 'true'));
    group.appendChild(button);
  });
}

function generateTOC() {
  const list = document.querySelector('.table-of-contents ul');
  if (!list) return;
  list.replaceChildren();
  document.querySelectorAll('.post-content h2').forEach((heading, index) => {
    if (!heading.id) {
      let id = `heading-${index}`;
      while (document.getElementById(id)) id += '-section';
      heading.id = id;
    }
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.appendChild(link);
    list.appendChild(item);
  });
}

function setupReadingTools() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.type = 'button';
  button.textContent = '↑';
  button.setAttribute('aria-label', 'ページの先頭へ戻る');
  button.hidden = true;
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  document.body.appendChild(button);
  const bar = document.querySelector('.post-header') ? document.createElement('div') : null;
  if (bar) {
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  const update = () => {
    button.hidden = window.scrollY < 500;
    if (bar) {
      const height = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${height > 0 ? window.scrollY / height * 100 : 0}%`;
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('main');
  if (main) {
    main.id ||= 'main-content';
    main.tabIndex = -1;
  }
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = getRootPrefix() + 'assets/img/favicon.svg';
  if (!document.querySelector('link[rel="icon"]')) document.head.appendChild(icon);
  generateTOC();
  setupGroupedListCollapse();
  setupReadingTools();
  await Promise.all([
    loadComponent('header-placeholder', 'includes/header.html'),
    loadComponent('footer-placeholder', 'includes/footer.html')
  ]);
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
  setupNavigation();
});
