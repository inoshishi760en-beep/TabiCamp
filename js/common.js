// 共通部分（header, footer）を読み込む関数
function getRootPrefix() {
  try {
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

async function loadComponent(elementId, filePath) {
  try {
    const prefix = getRootPrefix();
    const response = await fetch(prefix + filePath);
    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component from ${filePath}:`, error);
  }
}

// ページ読み込み時に共通部分を挿入
document.addEventListener('DOMContentLoaded', async function() {
  // Inline化していない旧ページのみ読み込む
  if (document.getElementById('header-placeholder')) {
    await loadComponent('header-placeholder', 'includes/header.html');
  }
  if (document.getElementById('footer-placeholder')) {
    await loadComponent('footer-placeholder', 'includes/footer.html');
  }
  updateFooterYear();

  // ナビゲーションのアクティブ状態を設定
  setActiveNav();

  // トップへ戻るボタンを設置
  setupBackToTop();

  // スクロール連動の動き
  setupScrollAnimations();
  setupHeaderAutoHide();
  setupScrollProgress();
  setupParallaxHeader();
  // トップページ検索の初期化
  setupPostSearch();
});

// 現在のページに応じてナビゲーションのアクティブ状態を設定
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

// トップへ戻るボタン
function setupBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'トップへ戻る');
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

// フッターの年号を更新（innerHTML 追加だと埋め込み<script>が実行されないため）
function updateFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

// スクロールアニメーション（IntersectionObserver）
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

  // reduced motion の場合は即時表示
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

// ヘッダーの自動隠し/表示
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

// ヒーロー（ページヘッダー）のパララックス
function setupParallaxHeader() {
  const hero = document.querySelector('.page-header');
  if (!hero) return;

  let ticking = false;
  function update() {
    const rect = hero.getBoundingClientRect();
    // ビューポート内にあるときのみ更新
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const factor = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      const y = Math.round((factor * 20) - 10); // -10px 〜 +10px 程度
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

// トップページの簡易検索フィルタ
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

// 目次（TOC）を自動生成する関数
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
    // 見出しにIDを付与
    const id = `heading-${index}`;
    heading.id = id;

    // 目次リストアイテムを作成
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

  // 記事ページの場合、TOCを生成
  if (document.querySelector('.post-content')) {
    generateTOC();
  }
});
