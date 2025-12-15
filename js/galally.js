// ================================================================
// 横スクロール機能の実装
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
    const scrollContainer = document.querySelector('.scroll-container');
    let scrollPosition = 0;

    // スクロール処理
    function handleScroll(e) {
        e.preventDefault(); // デフォルトのスクロール動作を無効化
        if (window.innerWidth > 1300) {
            scrollContainer.scrollBy({
                left: e.deltaY, // 縦ホイールで横スクロール
            });
        } else {
            scrollContainer.scrollBy({
                top: e.deltaY, // 縦ホイールで縦スクロール
            });
        }
    }

    // 横スクロールと縦スクロールを切り替え
    function toggleScrollBehavior() {
        const screenWidth = window.innerWidth;
        scrollContainer.removeEventListener('wheel', handleScroll, { passive: false }); // イベントを一度解除

        if (screenWidth > 1300) {
            scrollContainer.addEventListener('wheel', handleScroll, { passive: false }); // 横スクロールを有効化
        }
    }

    // スクロール位置を保存
    function saveScrollPosition() {
        scrollPosition = scrollContainer.scrollLeft || scrollContainer.scrollTop;
    }

    // スクロール位置を復元
    function restoreScrollPosition() {
        scrollContainer.scrollTo({
            left: scrollPosition,
            behavior: 'instant',
        });
    }

    // レイアウト変更時にスクロール位置を保持して再描画
    function updateLayout() {
        saveScrollPosition();
        toggleScrollBehavior();
        restoreScrollPosition();
        forceRepaint(scrollContainer);
    }

    // 再描画を強制
    function forceRepaint(element) {
        element.style.display = 'none';
        element.offsetHeight; // リフローを強制
        element.style.display = '';
    }

    // 初期化
    toggleScrollBehavior();

    // 画面リサイズ時の処理
    window.addEventListener('resize', function () {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(updateLayout, 200); // デバウンス処理
    });
});

// ================================================================
// スマホサイズスクロール（jQuery）
// ================================================================
$(function () {
    function updateScrollBehavior() {
        if ($(window).width() <= 1280) {
            $('.scroll-container').removeClass('scroll-container').addClass('sp-scroll-box');
        } else {
            $('.sp-scroll-box').removeClass('sp-scroll-box').addClass('scroll-container');
        }
    }

    // ページ読み込み時とリサイズ時の処理
    $(document).ready(updateScrollBehavior);
    $(window).on('resize', function () {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(updateScrollBehavior, 200); // デバウンス処理
    });
});
// ================================================================
// 横スクロール機能の実装
// ================================================================
document.addEventListener('DOMContentLoaded', function () {
    const scrollContainer = document.querySelector('.scroll-container');
    let scrollPosition = 0;

    // スクロール処理
    function handleScroll(e) {
        e.preventDefault(); // デフォルトのスクロール動作を無効化
        if (window.innerWidth > 1300) {
            scrollContainer.scrollBy({
                left: e.deltaY, // 縦ホイールで横スクロール
            });
        } else {
            scrollContainer.scrollBy({
                top: e.deltaY, // 縦ホイールで縦スクロール
            });
        }
    }

    // 横スクロールと縦スクロールを切り替え
    function toggleScrollBehavior() {
        const screenWidth = window.innerWidth;
        scrollContainer.removeEventListener('wheel', handleScroll, { passive: false }); // イベントを一度解除

        if (screenWidth > 1300) {
            scrollContainer.addEventListener('wheel', handleScroll, { passive: false }); // 横スクロールを有効化
        }
    }

    // スクロール位置を保存
    function saveScrollPosition() {
        scrollPosition = scrollContainer.scrollLeft || scrollContainer.scrollTop;
    }

    // スクロール位置を復元
    function restoreScrollPosition() {
        scrollContainer.scrollTo({
            left: scrollPosition,
            behavior: 'instant',
        });
    }

    // レイアウト変更時にスクロール位置を保持して再描画
    function updateLayout() {
        saveScrollPosition();
        toggleScrollBehavior();
        restoreScrollPosition();
        forceRepaint(scrollContainer);
    }

    // 再描画を強制
    function forceRepaint(element) {
        element.style.display = 'none';
        element.offsetHeight; // リフローを強制
        element.style.display = '';
    }

    // 初期化
    toggleScrollBehavior();

    // 画面リサイズ時の処理
    window.addEventListener('resize', function () {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(updateLayout, 200); // デバウンス処理
    });
});

// ================================================================
// スマホサイズスクロール（jQuery）
// ================================================================
$(function () {
    function updateScrollBehavior() {
        if ($(window).width() <= 1280) {
            $('.scroll-container').removeClass('scroll-container').addClass('sp-scroll-box');
        } else {
            $('.sp-scroll-box').removeClass('sp-scroll-box').addClass('scroll-container');
        }
    }

    // ページ読み込み時とリサイズ時の処理
    $(document).ready(updateScrollBehavior);
    $(window).on('resize', function () {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(updateScrollBehavior, 200); // デバウンス処理
    });
});
