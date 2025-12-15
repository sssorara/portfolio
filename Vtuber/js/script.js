// Simple Router Logic
function navigateTo(pageId, anchorId = null) {
  // Hide all pages
  const pages = document.querySelectorAll(".page-section");
  pages.forEach((page) => {
    page.classList.remove("active");
    // Wait for transition to finish before hiding
    setTimeout(() => {
      if (!page.classList.contains("active")) {
        page.style.display = "none";
      }
    }, 300);
  });

  // Show target page
  const target = document.getElementById(pageId + "-view");
  if (target) {
    target.style.display = "block";
    // Small timeout to allow display:block to apply before opacity transition
    setTimeout(() => {
      target.classList.add("active");
    }, 10);

    // If anchor provided (e.g., from home link to #updates)
    if (anchorId) {
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("hidden");
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // URLパラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section");

  if (section === "news") {
    // NEWS ビューを表示
    navigateTo("news");
  } else {
    // デフォルト: HOME ビューを表示
    const homeView = document.getElementById("home-view");
    if (homeView) {
      homeView.style.display = "block";
      setTimeout(() => {
        homeView.classList.add("active");
      }, 10);
    }
  }

  // NEWSフィルタ機能
  const filterButtons = document.querySelectorAll(".news-filter-btn");
  const newsItems = document.querySelectorAll("#news-view .news-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter; // "all" / "info" / "stream" / "goods"

      // ボタンの見た目のactive切り替え
      filterButtons.forEach((b) => {
        b.classList.remove("bg-neon-orange", "text-black");
        b.classList.add("border-gray-700", "text-gray-300");
      });
      btn.classList.add("bg-neon-orange", "text-black");
      btn.classList.remove("border-gray-700", "text-gray-300");

      // NEWSカードの表示切り替え
      newsItems.forEach((item) => {
        const cat = item.dataset.category;
        if (filter === "all" || cat === filter) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Scroll Animation Observer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(".fade-in-up");
  animatedElements.forEach((el) => {
    observer.observe(el);
  });
});
