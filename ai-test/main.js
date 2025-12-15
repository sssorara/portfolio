// main.js

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('mobile-menu-icon-open');
  const iconClose = document.getElementById('mobile-menu-icon-close');

  // モバイルメニュー開閉
  if (btn && menu && iconOpen && iconClose) {
    btn.addEventListener('click', () => {
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        menu.classList.remove('hidden');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
      } else {
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  }

  // モバイルメニューからリンクを押したら閉じる
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (menu && iconOpen && iconClose && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  });

  // ここから blog.html 用 カテゴリフィルター
  const filterButtons = document.querySelectorAll('.blog-filter');
  const posts = document.querySelectorAll('.blog-post');

  // blog 以外のページでは何もしない
  if (!filterButtons.length || !posts.length) return;

  const ACTIVE_CLASSES = [
    'bg-blue-600',
    'text-white',
    'shadow-lg',
    'shadow-blue-600/30'
  ];
  const INACTIVE_CLASSES = [
    'bg-white',
    'text-slate-600',
    'border',
    'border-slate-200'
  ];

  const setActiveButton = (activeBtn) => {
    filterButtons.forEach(btn => {
      btn.classList.remove(...ACTIVE_CLASSES);
      INACTIVE_CLASSES.forEach(c => {
        if (!btn.classList.contains(c)) btn.classList.add(c);
      });
    });

    activeBtn.classList.remove(...INACTIVE_CLASSES);
    ACTIVE_CLASSES.forEach(c => {
      if (!activeBtn.classList.contains(c)) activeBtn.classList.add(c);
    });
  };

  const filterPosts = (category) => {
    posts.forEach(post => {
      const postCat = post.dataset.category;
      if (category === 'All' || postCat === category) {
        post.style.display = '';
      } else {
        post.style.display = 'none';
      }
    });
  };

  // 初期状態: All
  const defaultBtn = document.querySelector('.blog-filter[data-filter="All"]');
  if (defaultBtn) {
    setActiveButton(defaultBtn);
    filterPosts('All');
  }

  // クリックイベント登録
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter || 'All';
      setActiveButton(btn);
      filterPosts(category);
    });
  });

  // 必要なら「現在ページのナビを強調」したい場合は、
  // location.pathname を見て .nav-link にクラスを付け替えるなども可能
});