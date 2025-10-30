import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidFragmentShader = `
  uniform sampler2D uPrevTrails;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform vec2 uResolution;
  uniform float uDecay;
  uniform bool uIsMoving;

  varying vec2 vUv;

  void main() {
    vec4 prevState = texture2D(uPrevTrails, vUv);

    float newValue = prevState.r * uDecay;

    if (uIsMoving) {
      vec2 mouseDirection = uMouse - uPrevMouse;
      float lineLength = length(mouseDirection);

      if (lineLength > 0.001) {
        vec2 mouseDir = mouseDirection / lineLength;

        vec2 toPixel = vUv - uPrevMouse;
        float projAlong = dot(toPixel, mouseDir);
        projAlong = clamp(projAlong, 0.0, lineLength);

        vec2 closestPoint = uPrevMouse + projAlong * mouseDir;
        float dist = length(vUv - closestPoint);

        float lineWidth = 0.09;
        float intensity = smoothstep(lineWidth, 0.0, dist) * 0.3;

        newValue += intensity;
      }
    }

    gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
  }
`;

const displayFragmentShader = `
  uniform sampler2D uFluid;
  uniform sampler2D uTopTexture;
  uniform sampler2D uBottomTexture;
  uniform vec2 uResolution;
  uniform float uDp;
  uniform vec2 uTopTextureSize;
  uniform vec2 uBottomTextureSize;

  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

    vec2 s = uResolution / textureSize;

    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;

    return (uv * uResolution - offset) / scaledSize;
  }

  void main() {
    float fluid = texture2D(uFluid, vUv).r;

    vec2 topUV = getCoverUV(vUv, uTopTextureSize);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize);

    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);

    float threshold = 0.02;
    float edgeWidth = 0.004 * uDp;

    float t = smoothstep(threshold, threshold + edgeWidth, fluid);
    vec4 finalColor = mix(topColor, bottomColor, t);

    gl_FragColor = finalColor;
  }
`;

function createPlaceholderTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 2, 2);
  return new THREE.CanvasTexture(canvas);
}

export function initFluidAnimation() {
  const canvas = document.querySelector("#fluid-canvas");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    precision: "highp",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const prevMouse = new THREE.Vector2(0.5, 0.5);
  let isMoving = false;
  let lastMoveTime = 0;
  let mouseInCanvas = false;

  const size = 500;
  const pingPongTargets = [
    new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }),
    new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }),
  ];

  let currentTarget = 0;

  const topTexture = createPlaceholderTexture("#0000ff");
  const bottomTexture = createPlaceholderTexture("#ff0000");

  const topTextureSize = new THREE.Vector2(1, 1);
  const bottomTextureSize = new THREE.Vector2(1, 1);

  const trailsMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uPrevTrails: { value: null },
      uMouse: { value: mouse },
      uPrevMouse: { value: prevMouse },
      uResolution: { value: new THREE.Vector2(size, size) },
      uDecay: { value: 0.94 },
      uIsMoving: { value: false },
    },
    vertexShader,
    fragmentShader: fluidFragmentShader,
  });

  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uFluid: { value: null },
      uTopTexture: { value: topTexture },
      uBottomTexture: { value: bottomTexture },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uDp: { value: Math.min(window.devicePixelRatio, 2) },
      uTopTextureSize: { value: topTextureSize },
      uBottomTextureSize: { value: bottomTextureSize },
    },
    vertexShader,
    fragmentShader: displayFragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const trailsQuad = new THREE.Mesh(geometry, trailsMaterial);
  const displayQuad = new THREE.Mesh(geometry, displayMaterial);

  const trailsScene = new THREE.Scene();
  trailsScene.add(trailsQuad);

  scene.add(displayQuad);

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  Promise.all([
    loadImage("assets/portrait_top.JPG"),
    loadImage("assets/portrait_bottom.PNG"),
  ]).then(([topImg, bottomImg]) => {
    if (topImg) {
      const texture = new THREE.Texture(topImg);
      texture.needsUpdate = true;
      displayMaterial.uniforms.uTopTexture.value = texture;
      topTextureSize.set(topImg.width, topImg.height);
    }
    if (bottomImg) {
      const texture = new THREE.Texture(bottomImg);
      texture.needsUpdate = true;
      displayMaterial.uniforms.uBottomTexture.value = texture;
      bottomTextureSize.set(bottomImg.width, bottomImg.height);
    }
  });

  canvas.addEventListener("mouseenter", () => {
    mouseInCanvas = true;
  });

  canvas.addEventListener("mouseleave", () => {
    mouseInCanvas = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!mouseInCanvas) return;

    const rect = canvas.getBoundingClientRect();
    prevMouse.copy(mouse);

    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = 1 - (e.clientY - rect.top) / rect.height;

    isMoving = true;
    lastMoveTime = Date.now();
  });

  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    displayMaterial.uniforms.uResolution.value.set(w, h);
    displayMaterial.uniforms.uDp.value = Math.min(window.devicePixelRatio, 2);
  });

  function animate() {
    requestAnimationFrame(animate);

    if (Date.now() - lastMoveTime > 100) {
      isMoving = false;
    }

    trailsMaterial.uniforms.uIsMoving.value = isMoving;
    trailsMaterial.uniforms.uPrevTrails.value =
      pingPongTargets[currentTarget].texture;

    renderer.setRenderTarget(pingPongTargets[1 - currentTarget]);
    renderer.render(trailsScene, camera);

    displayMaterial.uniforms.uFluid.value =
      pingPongTargets[1 - currentTarget].texture;

    currentTarget = 1 - currentTarget;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }

  animate();
}
