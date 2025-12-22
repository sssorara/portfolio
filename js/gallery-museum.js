// gallery-museum.js
// 美術館風 3Dギャラリー (DOM連動)
// Update: 「ゴージャス」な出現アニメーション (回転+光沢) & クリックノイズ除去

window.addEventListener('load', init);

function init() {
  // 1. DOM要素の取得
  const images = Array.from(document.querySelectorAll('.artwork-card img'));
  if (images.length === 0) return;

  // カード背景・枠線を消去
  const cards = document.querySelectorAll('.artwork-card');
  cards.forEach(card => {
      card.style.backgroundColor = 'transparent';
      card.style.boxShadow = 'none';
      card.style.border = 'none';
  });

  // 2. Three.js セットアップ
  const canvas = document.createElement('canvas');
  canvas.id = 'museum-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0'; 
  canvas.style.pointerEvents = 'none';

  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 10000);
  camera.position.z = 1000;

  // シェーダー定義 (画像用: 光沢スイープ)
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uShineProgress; // 0.0 -> 1.0
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      
      // 光沢エフェクト (斜めの光の帯)
      // -0.5 ~ 1.5 の範囲を移動
      float shinePos = uShineProgress * 2.0 - 0.5;
      float p = vUv.x + vUv.y * 0.5; // 斜め
      
      // 帯の太さと減衰
      float shine = smoothstep(0.0, 0.1, abs(p - shinePos));
      shine = 1.0 - shine; // 反転
      shine = pow(shine, 3.0); // 鋭く

      // 加算合成
      color.rgb += vec3(1.0) * shine * 0.4; // 白い光を乗せる(強度0.4)

      gl_FragColor = color; 
    }
  `;


  // 額縁のマテリアル (シックなダークグレー)
  const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x2c2c2c });
  const frameSideMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  
  const frameMaterials = [
      frameSideMaterial, // Right
      frameSideMaterial, // Left
      new THREE.MeshBasicMaterial({ color: 0x444444 }), // Top
      new THREE.MeshBasicMaterial({ color: 0x111111 }), // Bottom
      frameMaterial,     // Front
      frameSideMaterial  // Back
  ];


  // 3. Mesh作成
  const items = [];
  const textureLoader = new THREE.TextureLoader();

  images.forEach((img) => {
    
    const texture = textureLoader.load(img.src);
    
    const frontUniforms = {
        uTexture: { value: texture },
        uShineProgress: { value: 0.0 }
    };

    // 画像Mesh
    const imgGeometry = new THREE.PlaneGeometry(1, 1);
    const imgMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: frontUniforms,
        side: THREE.FrontSide
    });
    const imgMesh = new THREE.Mesh(imgGeometry, imgMaterial);

    // 額縁Mesh (親)
    const frameGeometry = new THREE.BoxGeometry(1, 1, 1);
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterials);
    
    frameMesh.add(imgMesh);
    imgMesh.position.z = 0.51; 

    scene.add(frameMesh);
    
    items.push({
        frame: frameMesh,
        imgMesh: imgMesh,
        img: img,
        uniforms: frontUniforms,
        scaleVelocity: 0,
        currentScaleAdd: 0,
        isRevealed: false,
        revealTime: 0
    });

    img.style.opacity = '0';
  });


  // 4. インタラクション
  let mouse = new THREE.Vector2(0, 0);
  let targetMouse = new THREE.Vector2(0, 0);
  
  const raycaster = new THREE.Raycaster();
  const rayMouse = new THREE.Vector2();

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    rayMouse.copy(targetMouse);
  });

  const clock = new THREE.Clock();

  window.addEventListener('click', (e) => {
    raycaster.setFromCamera(rayMouse, camera);
    const imgMeshes = items.map(item => item.imgMesh);
    const intersects = raycaster.intersectObjects(imgMeshes);

    if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const targetItem = items.find(item => item.imgMesh === hitObj);
        if (targetItem) {
            // シンプルなぽよぽよバウンドのみ (シェーダー歪みは削除)
            targetItem.scaleVelocity = 0.3; 
        }
    }
  });


  // 5. ループ
  function tick() {
    const time = clock.getElapsedTime();
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w || canvas.height !== h) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const fovRad = (45 * Math.PI) / 180;
        const dist = (h / 2) / Math.tan(fovRad / 2);
        camera.position.z = dist;
    }

    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    items.forEach((item) => {
        const { frame, imgMesh, img, uniforms } = item;
        const rect = img.getBoundingClientRect();

        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        const x = elementCenterX - w / 2;
        const y = -(elementCenterY - h / 2);

        // 出現判定
        if (!item.isRevealed) {
            if (rect.top < h * 0.9 && rect.bottom > 0) {
                item.isRevealed = true;
                item.revealTime = time;
                frame.scale.set(0,0,0);
                uniforms.uShineProgress.value = 0; // 光沢リセット
            } else {
                frame.visible = false;
            }
        }

        if (item.isRevealed) {
            frame.visible = true;
            
            // アニメーション定数
            const duration = 1.0;
            const elapsed = time - item.revealTime;
            const progress = Math.min(elapsed / duration, 1.0);
            
            // 1. スケール & バウンド(EaseOutElastic 風)
            // 少しオーバーシュートさせる
            const p = progress;
            const easeScale = 1 + Math.pow(p - 1, 3); // Cubic Ease Out
            // いや、ゴージャスならもっとゆったり Elastic?
            // シンプルに EaseOutBack で
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const easeBack = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
            
            //Scale計算
            const baseScale = easeBack;
            
            // 2. 回転 (Spin)
            // 出現時にクルッと回る (Y軸 1回転)
            // progress 0 -> 1 で Math.PI * 2 -> 0
            const spin = (1.0 - Math.pow(p, 0.5)) * Math.PI * 0.5; // 半回転くらいが上品か
            
            // 3. 光沢 (Shine)
            // 出現動作の後半でキラッと光る
            // progress 0.3 ~ 0.8 の間で uShineProgress 0->1
            let shineP = 0;
            if (p > 0.3) {
                shineP = (p - 0.3) / 0.5;
                shineP = Math.min(Math.max(shineP, 0), 1);
            }
            uniforms.uShineProgress.value = shineP;


            // バウンド物理計算 (クリック用)
            const k = 0.2; 
            const damp = 0.85; 
            const force = -k * item.currentScaleAdd;
            item.scaleVelocity += force;
            item.scaleVelocity *= damp;
            item.currentScaleAdd += item.scaleVelocity;

            // サイズ適用
            const border = 15;
            const totalWidth = rect.width + border * 2;
            const totalHeight = rect.height + border * 2;
            const frameDepth = 30;

            const sX = (1.0 + item.currentScaleAdd * 0.1) * baseScale;
            const sY = (1.0 - item.currentScaleAdd * 0.1) * baseScale;
            
            frame.position.set(x, y, 0);
            frame.scale.set(totalWidth * sX, totalHeight * sY, frameDepth * baseScale);

            imgMesh.scale.set(rect.width / totalWidth, rect.height / totalHeight, 1);
            
            // 回転適用 (マウス + 出現スピン)
            frame.rotation.x = (mouse.y * 0.3) + (y * 0.0003); 
            frame.rotation.y = (mouse.x * 0.3) + (x * 0.0003) + spin;

        } else {
            frame.position.set(x, y, 0);
        }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}
