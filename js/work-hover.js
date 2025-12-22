// work-hover.js
// WORK画像(background-image)をThree.jsで表示し、ホバー時にLiquid歪みエフェクトをかける
// CSSのTransformと競合してブレるのを防ぐため、アニメーションはThree.js側で行う

window.addEventListener('load', init);

function init() {
  const targets = Array.from(document.querySelectorAll('.img-box'));
  if (targets.length === 0) return;

  // 1. Setup Three.js
  const canvas = document.createElement('canvas');
  canvas.id = 'work-canvas';
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

  // 2. Shader Setup
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Liquid Distortion Shader
  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uHover; // 0.0 -> 1.0
    uniform float uTime;
    varying vec2 vUv;

    // Simplex Noise (簡易版)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // 歪み計算
      float noise = snoise(uv * 10.0 + uTime * 2.0);
      
      // ホバー時のみ歪ませる
      float distortion = noise * uHover * 0.05;
      
      vec2 distortedUv = uv + distortion;
      
      vec4 color = texture2D(uTexture, distortedUv);
      
      // RGBシフト (Aberration)
      float shift = uHover * 0.01;
      color.r = texture2D(uTexture, distortedUv + vec2(shift, 0.0)).r;
      color.b = texture2D(uTexture, distortedUv - vec2(shift, 0.0)).b;
      
      gl_FragColor = color; 
    }
  `;

  // Shadow Shader (Soft gradients)
  const shadowFragmentShader = `
    varying vec2 vUv;
    uniform float uHover;
    void main() {
      // 矩形の距離フィールド的な計算でぼかす
      vec2 d = abs(vUv - 0.5) * 2.0;
      // 0.8あたりから1.0にかけてalphaを減衰させる
      float alphaX = 1.0 - smoothstep(0.8, 1.0, d.x);
      float alphaY = 1.0 - smoothstep(0.8, 1.0, d.y);
      float alpha = alphaX * alphaY;
      
      // ホバー時は影を濃く、広くする？
      // ここではシンプルにベースの影を描画
      // 色は黒、Alphaで調整
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * 0.5); 
    }
  `;

  // 3. Meshes
  const items = [];
  const textureLoader = new THREE.TextureLoader();

  targets.forEach((el) => {
    // get background-image url
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage; 
    // css value: url("...")
    const url = bgImage.slice(4, -1).replace(/"/g, "");
    
    if (!url || url === 'none') return; 

    // Main Mesh
    const texture = textureLoader.load(url);
    const uniforms = {
        uTexture: { value: texture },
        uHover: { value: 0 },
        uTime: { value: 0 }
    };
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32); 
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.FrontSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Shadow Mesh
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadowMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: shadowFragmentShader,
        uniforms: { uHover: uniforms.uHover }, // share reference
        transparent: true,
        depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    scene.add(shadowMesh);
    // shadow should be behind
    shadowMesh.renderOrder = -1; 

    items.push({
        mesh,
        shadowMesh,
        el,
        uniforms,
        isHovered: false
    });

    // 元の要素の背景を消す (透明に)
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = 'transparent'; 
    el.style.boxShadow = 'none'; // DOMの影を消す
    
    // CSSアニメーション(transform: scaleなど)による座標ズレを防ぐため無効化
    el.style.transition = 'none';
    el.style.transform = 'none';
    
    // hover時のCSS変更もjsで上書き（重要: inline styleで強制）
    // CSSの:hoverでtransformがかかっているとgetBoundingClientRectが動いてしまい
    // Three.js側の追従が遅れてブレる原因になる。
    // そのため、動きはThree.js側で再現する。
    
    // マウスオーバーイベントで強制的にスタイルを固定し続ける
    el.addEventListener('mouseenter', () => {
        el.style.transform = 'none';
    });
  });

  // 4. Interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-999, -999);

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

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

    raycaster.setFromCamera(mouse, camera);
    const allMeshes = items.map(i => i.mesh);
    const intersects = raycaster.intersectObjects(allMeshes);

    items.forEach((item) => {
        const { mesh, shadowMesh, el, uniforms } = item;
        
        // CSS transformを無効化しているので、rectは静止位置(スクロール量込み)を返す
        const rect = el.getBoundingClientRect();
        
        // Sync position (Base)
        const x = (rect.left + rect.width / 2) - w / 2;
        const y = -((rect.top + rect.height / 2) - h / 2);
        
        // Hover detection
        const isHit = intersects.find(hit => hit.object === mesh);
        const targetHover = isHit ? 1.0 : 0.0;
        
        // Lerp
        uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.1;
        uniforms.uTime.value = time;

        // アニメーション (Scale & Lift)
        // CSSの:hover { transform: scale(1.05) translateY(-5px); } を再現
        const hoverVal = uniforms.uHover.value;
        const scaleAnim = 1.0 + hoverVal * 0.05; // 1.0 -> 1.05
        const liftAnim = hoverVal * 5.0; // 0 -> 5px (Y軸プラス方向へ)

        // Main Mesh Update
        mesh.scale.set(rect.width * scaleAnim, rect.height * scaleAnim, 1);
        mesh.position.set(x, y + liftAnim, 0);

        // Shadow Mesh Update
        // Shadow stays behind and drops down as image lifts
        // CSS: box-shadow: 5px 15px 25px rgba(0, 0, 0, 0.4);
        // Base Shadow: 3px 3px 3px rgba(0, 0, 0, 0.7);
        
        const shadowOffsetX = 3.0 + (hoverVal * 2.0); // 3 -> 5
        const shadowOffsetY = -(3.0 + (hoverVal * 12.0)); // -3 -> -15
        
        // Shadow scale: slight increase or consistent? 
        // When lifting, shadow might get softer (simulate with scale?)
        // Let's keep scale simple
        shadowMesh.scale.set(rect.width * scaleAnim * 1.02, rect.height * scaleAnim * 1.02, 1);
        shadowMesh.position.set(x + shadowOffsetX, y + liftAnim + shadowOffsetY, -10);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}
