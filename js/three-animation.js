// three-animation.js

window.addEventListener('load', init);

function init() {
  const mainVisual = document.querySelector('.mainvisual');
  if (!mainVisual) return;

  let width = mainVisual.clientWidth;
  let height = mainVisual.clientHeight;

  // レンダラー
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // スタイル設定
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '0'; // 背景に戻す
  mainVisual.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    width / -2, width / 2,
    height / 2, height / -2,
    1, 1000
  );
  camera.position.set(0, 0, 10);

  // 画像リスト
  const imageUrls = [
    'img/main_01.jpg',
    'img/main_02.jpg',
    'img/main_03.jpg',
    'img/main_05.jpg',
    'img/sam-d.png',
    'img/main_06.jpg'
  ];

  const loader = new THREE.TextureLoader();
  const textures = imageUrls.map(url => loader.load(url));

  let currentIndex = 0;

  // Shader
  const uniforms = {
    uTime: { value: 0 },
    uTexture: { value: textures[0] },      // 現在の画像
    uNextTexture: { value: textures[1] },  // 次の画像（クロスフェード用）
    uProgress: { value: 0.0 },             // 遷移の進捗 (0.0 -> 1.0)
    uMouse: { value: new THREE.Vector2(0, 0) }, 
    uResolution: { value: new THREE.Vector2(width, height) },
    uWaveIntensity: { value: 0.0 }
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform sampler2D uNextTexture;
    uniform float uProgress;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uWaveIntensity;

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // マウスインタラクション（波）
      vec2 mousePos = uMouse * 0.5 + 0.5;
      float dist = distance(uv, mousePos);
      
      // マウス付近の局所的な波
      float mouseWave = sin(dist * 20.0 - uTime * 5.0) * exp(-dist * 5.0) * uWaveIntensity * 0.05;

      // UV座標をずらす
      uv.x += mouseWave;
      uv.y += mouseWave;

      // 2枚の画像を読み込む
      vec4 color1 = texture2D(uTexture, uv);
      vec4 color2 = texture2D(uNextTexture, uv);

      // クロスフェード (uProgress 0->1 で color1->color2 へ)
      vec4 finalColor = mix(color1, color2, uProgress);

      gl_FragColor = finalColor;
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
  });

  const geometry = new THREE.PlaneGeometry(width, height);
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // マウスイベント
  let targetMouseX = 0;
  let targetMouseY = 0;
  let waveStrength = 0;

  document.addEventListener('mousemove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    targetMouseX = (x / width) * 2 - 1;
    targetMouseY = -(y / height) * 2 + 1;

    waveStrength = 2.0;
  });

  // 時間管理
  let nextIndex = 1;
  let transitionTimer = 0;
  const displayDuration = 400; // 画像を表示する時間（フレーム数目安。300frame ≒ 5秒）
  const transitionDuration = 120; // 遷移にかかる時間（120frame ≒ 2秒）に延長して分かりやすく
  let isTransitioning = false;

  // アニメーションループ
  function tick() {
    uniforms.uTime.value += 0.05;

    // マウス位置の更新
    uniforms.uMouse.value.x += (targetMouseX - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (targetMouseY - uniforms.uMouse.value.y) * 0.05;

    // 波の強さの減衰
    waveStrength *= 0.95;
    uniforms.uWaveIntensity.value = waveStrength;

    // スライドショーの遷移ロジック
    if (!isTransitioning) {
      // 表示期間
      transitionTimer++;
      if (transitionTimer > displayDuration) {
        isTransitioning = true;
        transitionTimer = 0;
        
        // 次の画像をセット（念のため）
        uniforms.uNextTexture.value = textures[nextIndex];
      }
    } else {
      // 遷移期間 (フェード)
      transitionTimer++;
      const progress = Math.min(transitionTimer / transitionDuration, 1.0);
      uniforms.uProgress.value = progress;

      if (progress >= 1.0) {
        // 遷移完了
        isTransitioning = false;
        transitionTimer = 0;
        uniforms.uProgress.value = 0.0;

        // 次の画像を現在の画像にする
        uniforms.uTexture.value = textures[nextIndex];
        
        // 更に次の画像を準備
        currentIndex = nextIndex;
        nextIndex = (currentIndex + 1) % textures.length;
        uniforms.uNextTexture.value = textures[nextIndex];
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();

  // リサイズ
  window.addEventListener('resize', () => {
    width = mainVisual.clientWidth;
    height = mainVisual.clientHeight;
    renderer.setSize(width, height);
    
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    plane.geometry.dispose(); 
    plane.geometry = new THREE.PlaneGeometry(width, height);
    uniforms.uResolution.value.set(width, height);
  });
}
