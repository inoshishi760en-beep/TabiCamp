function getRootPrefix() {
  try {
    const meta = document.querySelector('meta[name="site-root"]');
    if (meta && meta.content != null) {
      return meta.content;
    }
    // Prefer deriving from main.css link to be robust across local/GH Pages
    const mainLink = document.querySelector('link[href*="assets/css/main.css"]');
    if (mainLink) {
      const href = mainLink.getAttribute('href') || '';
      const marker = 'assets/css/main.css';
      const pos = href.indexOf(marker);
      if (pos >= 0) {
        return href.slice(0, pos); // e.g. '../../' or ''
      }
    }
    // Fallback: compute by path depth
    const segs = window.location.pathname.split('/').filter(Boolean);
    const depth = Math.max(0, segs.length - 2);
    return '../'.repeat(depth);
  } catch (_) {
    return '';
  }
}

function ensureFaviconLinks() {
  try {
    if (!document || !document.head) return;
    const prefix = getRootPrefix();
    const config = [
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'assets/img/favicon-32.png' },
      { rel: 'icon', type: 'image/png', sizes: '48x48', href: 'assets/img/favicon-48.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: 'assets/img/favicon-180.png' },
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
    ];

    config.forEach(def => {
      const selectorParts = [`link[rel="${def.rel}"]`];
      if (def.sizes) selectorParts.push(`[sizes="${def.sizes}"]`);
      if (def.type) selectorParts.push(`[type="${def.type}"]`);
      const selector = selectorParts.join('');
      const existing = document.head.querySelector(selector);
      const link = existing || document.createElement('link');
      link.rel = def.rel;
      if (def.type) link.type = def.type;
      if (def.sizes) link.sizes = def.sizes;
      link.href = `${prefix}${def.href}`;
      if (!existing) {
        document.head.appendChild(link);
      }
    });
  } catch (error) {
    console.error('Failed to ensure favicon links', error);
  }
}

function getInlineComponentHtml(elementId) {
  if (elementId === 'header-placeholder') {
    return `
<header class="site-header">
  <div class="container">
    <div class="header-inner">
      <div class="site-branding">
        <a href="index.html" class="site-title">Camp Site</a>
      </div>

      <button class="nav-toggle" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>

      <nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
        <a href="index.html">ホーム</a>
        <a href="categories.html">カテゴリ</a>
        <a href="about.html">このサイトについて</a>
        <a href="contact.html">お問い合わせ</a>
      </nav>
    </div>
  </div>
</header>`;
  }
  if (elementId === 'footer-placeholder') {
    return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Camp Site</h3>
        <p>キャンプ場レビューとアウトドア情報を発信するブログです。</p>
      </div>

      <div class="footer-section">
        <h3>リンク</h3>
        <ul class="footer-links">
          <li><a href="about.html">このサイトについて</a></li>
          <li><a href="contact.html">お問い合わせ</a></li>
          <li><a href="privacy.html">プライバシーポリシー</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; <span id="current-year"></span> Camp Site. All rights reserved.</p>
    </div>
  </div>
</footer>`;
  }

document.addEventListener('DOMContentLoaded', async function() {
  ensureFaviconLinks();
  if (document.getElementById('header-placeholder')) {
    await loadComponent('header-placeholder', 'includes/header.html');
  }
  if (document.getElementById('footer-placeholder')) {
    await loadComponent('footer-placeholder', 'includes/footer.html');
  }
  updateFooterYear();

  setActiveNav();
  setupNavToggle();

  setupBackToTop();

  setupScrollAnimations();
  setupHeaderAutoHide();
  setupScrollProgress();
  setupGroupedListCollapse();
  setupParallaxHeader();
  setupPostSearch();
  prefixInternalLinks();
});

function setupGroupedListCollapse() {
  const MAX_VISIBLE = 5;
  const groups = document.querySelectorAll('.categories-list .category-item');
  if (groups.length === 0) return;

  groups.forEach(group => {
    const list = group.querySelector('ul');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('li'));
    const total = items.length;
    if (total <= MAX_VISIBLE) return;

    const countEl = group.querySelector('p');
    if (countEl) {
    }

    items.forEach((li, index) => {
      if (index >= MAX_VISIBLE) {
        li.classList.add('is-collapsed');
      }
    });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'category-toggle';
    toggle.textContent = `${total}件すべて表示`;

    let expanded = false;
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      items.forEach((li, index) => {
        if (index >= MAX_VISIBLE) {
          li.classList.toggle('is-collapsed', !expanded);
        }
      });
      toggle.textContent = expanded ? '折りたたむ' : `${total}件すべて表示`;
    });

    group.appendChild(toggle);
  });
}

function setActiveNav() {
  const getPage = (path) => {
    const seg = path.split('?')[0].split('#')[0].split('/').filter(Boolean);
    const last = seg[seg.length - 1] || '';
    return last === '' ? 'index.html' : last;
  };

  const currentPage = getPage(window.location.pathname);
  const navLinks = document.querySelectorAll('.site-nav a');

  navLinks.forEach(link => {
    const linkPage = getPage(new URL(link.href, window.location.href).pathname);
    if (currentPage === linkPage) {
      link.classList.add('active');
    }
  });
}

function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const update = (open) => {
    toggle.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  let isOpen = false;
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    update(isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) {
        isOpen = false;
        update(false);
      }
    });
  });
}

function setupBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'トップへ戻めE);
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l7 7-1.41 1.41L13 9.83V19h-2V9.83L6.41 13.41 5 12z"/></svg>';
  document.body.appendChild(btn);

  function toggle() {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function prefixInternalLinks() {
  const prefix = getRootPrefix();
  const anchors = document.querySelectorAll('.site-nav a, .footer-links a, .site-branding a');
  anchors.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href) return;
    // 外部/フラグメンチEプロトコル付きは対象夁E
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return;
    if (/^(\.\.\/|\.\/)/.test(href)) return;
    // 先頭に接頭辞を付丁E
    a.setAttribute('href', prefix + href);
  });
}

function updateFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

function setupScrollAnimations() {
  const targets = [
    ...document.querySelectorAll('.post-card'),
    ...document.querySelectorAll('.category-item'),
    ...document.querySelectorAll('.quick-link'),
    ...document.querySelectorAll('.footer-section'),
    ...document.querySelectorAll('.tags-cloud .tag-item')
  ];

  if (targets.length === 0) return;

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 0) el.classList.add('from-left');
    else if (i % 3 === 1) el.classList.add('from-right');
    else el.classList.add('zoom');
  });

  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce || ('IntersectionObserver' in window === false)) {
    targets.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
}

// ヘッダーの自動隠ぁE表示
function setupHeaderAutoHide() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const goingDown = y > lastY;
    const beyond = y > 120;
    if (goingDown && beyond) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

// スクロール進捗バー
function setupScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  function update() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const p = h > 0 ? (scrollTop / h) * 100 : 0;
    bar.style.width = p + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function setupParallaxHeader() {
  const hero = document.querySelector('.page-header');
  if (!hero) return;

  let ticking = false;
  function update() {
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const factor = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const y = Math.round((factor * 20) - 10); // -10px 、E+10px 程度
      hero.style.backgroundPosition = `center ${y}px`;
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

function setupPostSearch() {
  const input = document.getElementById('post-search');
  const grid = document.querySelector('.posts-grid');
  if (!input || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.post-card'));

  let emptyEl = document.getElementById('search-empty');
  if (!emptyEl) {
    emptyEl = document.createElement('p');
    emptyEl.id = 'search-empty';
    emptyEl.textContent = '該当する記事がありません';
    emptyEl.style.display = 'none';
    emptyEl.style.color = 'var(--color-text-light)';
    emptyEl.style.textAlign = 'center';
    emptyEl.style.margin = 'var(--spacing-xl) 0';
    grid.after(emptyEl);
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const title = card.querySelector('.post-card-title')?.textContent?.toLowerCase() || '';
      const excerpt = card.querySelector('.post-card-excerpt')?.textContent?.toLowerCase() || '';
      const category = card.querySelector('.card-category')?.textContent?.toLowerCase() || '';
      const hit = q === '' || title.includes(q) || excerpt.includes(q) || category.includes(q);
      card.style.display = hit ? '' : 'none';
      if (hit) visible++;
    });
    emptyEl.style.display = visible === 0 ? '' : 'none';
  });
}

function generateTOC() {
  const content = document.querySelector('.post-content');
  const tocContainer = document.querySelector('.table-of-contents ul');

  if (!content || !tocContainer) return;

  const headings = content.querySelectorAll('h2');

  if (headings.length === 0) {
    const tocElement = document.querySelector('.table-of-contents');
    if (tocElement) tocElement.style.display = 'none';
    return;
  }

  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = heading.textContent;
    li.appendChild(a);
    tocContainer.appendChild(li);
  });
}

// スムーズスクロール
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  if (document.querySelector('.post-content')) {
    generateTOC();
  }
});




