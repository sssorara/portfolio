// blog.js
(() => {
  "use strict";
  // ブログデータ（ここに記事を追加・編集してください）
  const blogPosts = [
    {
      id: 1,
      date: "2023.10.25",
      title: "ウェブサイトのデザインをリニューアルしました",
      thumbnail:
        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1000&auto=format&fit=crop",
      content: `
                <p>長らく放置していたポートフォリオサイトのデザインを一新しました。以前のデザインも気に入っていたのですが、スマートフォンでの表示最適化と、情報の整理を行いたかったためです。</p>
                <p>今回は「余白」を意識して、作品が見やすい構成を心がけました。CSS設計も見直し、メンテナンス性を高めています。</p>
                <p>今後はこちらのブログで制作の裏側や、日々の気付きを発信していこうと思います。</p>
            `,
    },
    {
      id: 2,
      date: "2023.11.02",
      title: "最近の制作環境とデスク周りについて",
      thumbnail:
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop",
      content: `
                <p>最近、作業効率を上げるためにデスク周りの配置換えを行いました。特にモニターアームを導入したことで、机の上が広くなり、アイデア出しのノートを広げやすくなりました。</p>
                <p>制作環境としては、VS Codeをメインエディタとして使用しています。拡張機能を整理し、必要最低限のものに絞ることで動作も軽快になりました。</p>
                <p>良い環境は良いアウトプットに繋がると信じて、これからも少しずつアップデートしていきたいです。</p>
            `,
    },
    {
      id: 3,
      date: "2023.11.15",
      title: "新しい配色のインスピレーション",
      thumbnail:
        "https://images.unsplash.com/photo-1502691876148-a84978e59af8?q=80&w=1000&auto=format&fit=crop",
      content: `
                <p>週末に訪れた美術館で、素晴らしい色彩感覚に触れることができました。普段ウェブデザインをしていると、どうしてもRGBの色域やディスプレイ上での見え方を優先してしまいますが、絵画の持つテクスチャや色の重なりは、デジタルの世界にも応用できるヒントがたくさんあります。</p>
                <p>次回のプロジェクトでは、少し彩度を抑えつつも深みのある色合いに挑戦してみたいと考えています。</p>
            `,
    },
    {
      id: 4,
      date: "2023.12.01",
      title: "JavaScriptの学習メモ",
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
      content: `
                <p>最近はフレームワークに頼らず、Vanilla JS（素のJavaScript）でDOM操作を書く楽しさを再確認しています。</p>
                <p>ライブラリを使えば簡単に実装できることも多いですが、基礎的な仕組みを理解していないと、予期せぬバグに遭遇した際に対処できません。今日は非同期処理のPromiseとasync/awaitについて改めて復習しました。</p>
                <p>コードが意図通りに動いた瞬間の喜びは、何度味わっても良いものです。</p>
            `,
    },
  ];

  // DOM要素の取得
  const listView = document.getElementById("list-view");
  const detailView = document.getElementById("detail-view");
  const listContainer = document.getElementById("blog-list-container");
  const articleContent = document.getElementById("article-content");

  // リストの描画
  function renderList() {
    listContainer.innerHTML = ""; // リセット
    blogPosts.forEach((post) => {
      const li = document.createElement("li");
      li.className = "blog-item";
      li.onclick = () => showDetail(post.id);

      li.innerHTML = `
                <div class="post-meta">${post.date}</div>
                <h3 class="post-title-preview">${post.title}</h3>
            `;
      listContainer.appendChild(li);
    });
  }

  // 詳細の表示
  function showDetail(id) {
    const post = blogPosts.find((p) => p.id === id);
    if (!post) return;

    // 詳細コンテンツの生成
    articleContent.innerHTML = `
            <span class="detail-date">${post.date}</span>
            <h2 class="detail-title">${post.title}</h2>
            <img src="${post.thumbnail}" alt="${post.title}" class="detail-thumbnail">
            <div class="detail-content">
                ${post.content}
            </div>
        `;

    // 画面切り替え（スクロール位置をトップへ）
    listView.classList.add("hidden");
    detailView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 一覧に戻る
  function showList() {
    detailView.classList.add("hidden");
    listView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 初期化実行
  renderList();
})();
