// ============================================================
// マウスストーカー
// ============================================================
// マウスストーカー用のdivを取得
const stalker = document.getElementById("stalker");

// aタグにホバー中かどうかの判別フラグ
let hovFlag = false;

// マウスに追従させる処理 （リンクに吸い付いてる時は除外する）
document.addEventListener("mousemove", function (e) {
  if (!hovFlag) {
    stalker.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px) translate(-50%, -50%)";
  }
});

// リンクへ吸い付く処理
const linkElem = document.querySelectorAll("a:not(.no_stick_)");

// リンクの数を確認するためのログ出力
console.log("リンクの数: " + linkElem.length);

// すべてのリンクに対してイベントリスナーを設定
linkElem.forEach((link, i) => {
  console.log(`リンク ${i + 1}: イベント設定`);

  // マウスホバー時
  link.addEventListener("mouseover", function (e) {
    hovFlag = true;

    // マウスストーカーにクラスをつける
    stalker.classList.add("hov_");

    // マウスストーカーの位置をリンクの中心に固定
    let rect = e.target.getBoundingClientRect();
    let posX = rect.left + rect.width / 2;
    let posY = rect.top + rect.height / 2;

    stalker.style.transform =
      "translate(" + posX + "px, " + posY + "px) translate(-50%, -50%)";
  });

  // マウスホバー解除時
  link.addEventListener("mouseout", function (e) {
    hovFlag = false;
    stalker.classList.remove("hov_");
  });
});
// ============================================================
// mainタグに入ったら白色に変更
// ============================================================

$("main").on("mouseenter", function () {
  $("#stalker").css("background-color", "rgba(255, 255, 255, 0.5)"); // 白に変更
});

// mainタグから出たときに元の色に戻す
$("main").on("mouseleave", function () {
  $("#stalker").css("background-color", ""); // CSS定義に戻す
});
// ============================================================
// PROFILEタグに入ったら黒色に変更
// ============================================================
$(".PROFILE").on("mouseenter", function () {
  $("#stalker").css("background-color", "rgba(255, 255, 255, 0.8)"); // 背景が暗いため白に変更
});

// mainタグから出たときに元の色に戻す
$(".PROFILE").on("mouseleave", function () {
  $("#stalker").css("background-color", ""); // 元に戻す
});

// ================================================================
// ハンバーガーメニュー
// ================================================================

$(function () {
  $(".ham-btn,.sp-menu a").on("click", function () {
    $(".ham-btn,.sp-menu").toggleClass("is-active");
  });

  // ================================================================
  // ローディング
  // ================================================================

  //テキストのカウントアップ+バーの設定
  var bar = new ProgressBar.Line(splash_text, {
    //id名を指定
    easing: "easeInOut", //アニメーション効果linear、easeIn、easeOut、easeInOutが指定可能
    duration: 1000, //時間指定(1000＝1秒)
    strokeWidth: 0.2, //進捗ゲージの太さ
    color: "#555", //進捗ゲージのカラー
    trailWidth: 0.2, //ゲージベースの線の太さ
    trailColor: "#bbb", //ゲージベースの線のカラー
    text: {
      //テキストの形状を直接指定
      style: {
        //天地中央に配置
        position: "absolute",
        left: "50%",
        top: "50%",
        padding: "0",
        margin: "-30px 0 0 0", //バーより上に配置
        transform: "translate(-50%,-50%)",
        "font-size": "1rem",
        color: "#fff",
      },
      autoStyleContainer: false, //自動付与のスタイルを切る
    },
    step: function (state, bar) {
      bar.setText(Math.round(bar.value() * 100) + " %"); //テキストの数値
    },
  });

  //アニメーションスタート
  bar.animate(1.0, function () {
    //バーを描画する割合を指定します 1.0 なら100%まで描画します
    $("#splash_text").fadeOut(10); //フェードアウトでローディングテキストを削除
    $(".loader_cover-up").addClass("coveranime"); //カバーが上に上がるクラス追加
    $(".loader_cover-down").addClass("coveranime"); //カバーが下に下がるクラス追加
    $("#splash").fadeOut(); //#splashエリアをフェードアウト
  });
});
// ページごとの識別子を動的に設定（URLのパス名を利用）
const pageIdentifier = window.location.pathname;

// ページごとに異なるキーで sessionStorage を確認
if (!sessionStorage.getItem(`access_${pageIdentifier}`)) {
  sessionStorage.setItem(`access_${pageIdentifier}`, "on");
} else {
  const topLoad = document.querySelector(".lording");
  if (topLoad) {
    topLoad.style.display = "none";
  }
}

//Intersection Observer
const target = document.querySelectorAll(".target");
const targetArray = Array.prototype.slice.call(target);
const options = {
  root: null,
  rootMargin: "0px 0px -20% 0px",
  threshold: 0,
};

const observer = new IntersectionObserver(callback, options);
targetArray.forEach((tgt) => {
  observer.observe(tgt);
});

function callback(entries) {
  entries.forEach(function (entry, i) {
    const target = entry.target;
    if (entry.isIntersecting) {
      const delay = i * 100;
      setTimeout(function () {
        target.classList.add("is-active-f");
      }, delay);
      observer.unobserve(target);
    }
    // else {
    //   target.classList.remove('is-active');
    // }
  });
}
