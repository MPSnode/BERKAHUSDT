import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RefreshCw } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { assetUrl } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-driven 3D coin choreography (Three.js + GSAP ScrollTrigger).
 *
 * HERO      : big coin centered, BERKAHUSDT face
 * SCENE 1   : coin spins freely then parks LEFT showing the USDT face (calculator on the right)
 * SCENE 2   : coin drops and parks RIGHT showing BERKAHUSDT face (rate chart on the left)
 * SCENE 3   : coin drops LEFT, held by an animated hand (social media info on the right)
 * SCENE 4   : coin escapes the hand, spins and stops RIGHT with BERKAHUSDT face (networks on the left)
 * SCENE 5   : coin centred at the bottom rotating slowly, orbited by small crypto coins
 */
const SCENES = [
  { id: 'scene-hero', side: 0, face: 'front', scale: 0.62, y: 0.06, spin: 0.35, orbit: 0.35, hand: 0 },
  { id: 'scene-calculator', side: -1, face: 'back', scale: 0.5, y: 0.02, spin: 1.1, orbit: 0.18, hand: 0 },
  { id: 'scene-chart', side: 1, face: 'front', scale: 0.48, y: -0.06, spin: 0.5, orbit: 0.18, hand: 0 },
  { id: 'scene-social', side: -1, face: 'back', scale: 0.42, y: -0.12, spin: 0.12, orbit: 0.12, hand: 1 },
  { id: 'scene-networks', side: 1, face: 'front', scale: 0.48, y: -0.04, spin: 0.9, orbit: 0.18, hand: 0 },
  { id: 'scene-footer', side: 0, face: 'front', scale: 0.34, y: -0.3, spin: 0.25, orbit: 1, hand: 0 },
];

export default function CoinCanvas3D() {
  const mountRef = useRef(null);
  const handRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeScene, setActiveScene] = useState('scene-hero');
  const { content } = useSite();

  const frontSrc = assetUrl(content?.coinFrontUrl) || '/coin_front.png';
  const backSrc = assetUrl(content?.coinBackUrl) || '/coin_back.png';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    let width = window.innerWidth;
    let height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    const coinGroup = new THREE.Group();
    mainGroup.add(coinGroup);

    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load(frontSrc, () => setIsLoaded(true));
    const backTexture = textureLoader.load(backSrc);
    [frontTexture, backTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.center.set(0.5, 0.5);
    });
    frontTexture.rotation = Math.PI / 2;
    backTexture.rotation = 0;

    const coinRadius = 2.7;
    const geometry = new THREE.CylinderGeometry(coinRadius, coinRadius, 0.35, 96);
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.95, roughness: 0.15 });
    const frontMaterial = new THREE.MeshStandardMaterial({ map: frontTexture, metalness: 0.35, roughness: 0.25, transparent: true });
    const backMaterial = new THREE.MeshStandardMaterial({ map: backTexture, metalness: 0.35, roughness: 0.25, transparent: true });
    const materials = [sideMaterial, frontMaterial, backMaterial];
    const coinMesh = new THREE.Mesh(geometry, materials);
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // ---------------- Orbiting crypto coins ---------------- //
    const gemsGroup = new THREE.Group();
    mainGroup.add(gemsGroup);
    const orbitCoins = [
      { name: 'ETH', textureUrl: '/coin_eth.png' },
      { name: 'BNB', textureUrl: '/coin_btc.png' },
      { name: 'BTC', textureUrl: '/coin_btc.png' },
      { name: 'USDC', textureUrl: '/coin_back.png' },
      { name: 'TRX', textureUrl: '/coin_trx.png' },
      { name: 'SOL', textureUrl: '/coin_sol.png' },
      { name: 'XRP', textureUrl: '/coin_xrp.png' },
      { name: 'DOGE', textureUrl: '/coin_doge.png' },
      { name: 'SHIB', textureUrl: '/coin_shib.png' },
    ];
    const gemMeshes = [];
    const orbitGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.09, 32);
    const orbitSideMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.95, roughness: 0.15 });

    orbitCoins.forEach((coin, i) => {
      const tex = textureLoader.load(coin.textureUrl);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.center.set(0.5, 0.5);
      const faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.35, roughness: 0.25, transparent: true });
      const mesh = new THREE.Mesh(orbitGeo, [orbitSideMat, faceMat, faceMat]);
      mesh.rotation.x = Math.PI / 2;
      const angle = (i / orbitCoins.length) * Math.PI * 2;
      const distance = 4.3 + (i % 3) * 0.7;
      mesh.userData = {
        name: coin.name,
        orbitAngle: angle,
        orbitSpeed: 0.25 + (i % 3) * 0.12,
        orbitDistance: distance,
        heightOffset: (i % 5 - 2) * 0.7,
        rotSpeedY: 0.02 + (i % 4) * 0.008,
        phaseX: i * 0.7,
        phaseY: i * 1.1,
        phaseZ: i * 1.7,
      };
      gemsGroup.add(mesh);
      gemMeshes.push(mesh);
    });

    // ---------------- Particles ---------------- //
    const particleCount = 320;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorEmerald = new THREE.Color(0x00e676);
    const colorGold = new THREE.Color(0xffd700);
    for (let i = 0; i < particleCount; i++) {
      const radius = 4 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
      const mix = Math.random() > 0.5 ? colorEmerald : colorGold;
      colors[i * 3] = mix.r;
      colors[i * 3 + 1] = mix.g;
      colors[i * 3 + 2] = mix.b;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleSystem = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
    );
    mainGroup.add(particleSystem);

    // ---------------- Lights ---------------- //
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const dirLight1 = new THREE.DirectionalLight(0xffd700, 3.0);
    dirLight1.position.set(6, 10, 6);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x00e676, 2.5);
    dirLight2.position.set(-6, -8, 4);
    scene.add(dirLight2);
    const pointLight = new THREE.PointLight(0x00e676, 2.5, 15);
    pointLight.position.set(0, 0, 7);
    scene.add(pointLight);

    // ---------------- Scene state driven by ScrollTrigger ---------------- //
    const viewHeight = 2 * Math.tan((45 * Math.PI) / 360) * camera.position.z;
    const getViewWidth = () => viewHeight * (window.innerWidth / window.innerHeight);
    const isMobile = () => window.innerWidth < 1024;

    const state = {
      side: 0,
      posX: 0,
      posY: viewHeight * 0.15,
      posZ: 0,
      scale: 1,
      faceRot: 0,
      spinSpeed: 0.35,
      orbitStrength: 0.25,
      handOpacity: 0,
      tiltX: 0,
      tiltZ: 0,
    };

    const applyScene = (config, immediate = false) => {
      const vw = getViewWidth();
      const mobile = isMobile();
      const targetX = mobile ? config.side * vw * 0.14 : config.side * vw * 0.26;
      const targetY = viewHeight * config.y * (mobile ? 0.6 : 1);
      const targetScale = (mobile ? config.scale * 0.62 : config.scale);
      const targetFace = config.face === 'back' ? Math.PI : 0;

      const tweenTarget = {
        posX: targetX,
        posY: targetY,
        scale: targetScale,
        faceRot: targetFace,
        spinSpeed: config.spin,
        orbitStrength: config.orbit,
        handOpacity: config.hand,
        posZ: config.side === 0 ? 0 : -0.6,
      };

      if (immediate) {
        Object.assign(state, tweenTarget);
        return;
      }
      gsap.to(state, { ...tweenTarget, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
      // extra free spin flourish when the coin travels between sides
      gsap.fromTo(
        state,
        { tiltX: state.tiltX, tiltZ: state.tiltZ },
        { tiltX: config.side * 0.25, tiltZ: -config.side * 0.18, duration: 1.6, ease: 'power2.out', overwrite: 'auto' }
      );
    };

    applyScene(SCENES[0], true);

    const triggers = SCENES.map((config) => {
      const el = document.getElementById(config.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 65%',
        end: 'bottom 35%',
        onEnter: () => {
          applyScene(config);
          setActiveScene(config.id);
        },
        onEnterBack: () => {
          applyScene(config);
          setActiveScene(config.id);
        },
      });
    });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    const handlePointerMove = (e) => {
      targetMouseX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.4;
      targetMouseY = (-(e.clientY / window.innerHeight) * 2 + 1) * 0.3;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    let animationFrameId;
    const clock = new THREE.Clock();
    let spinAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.05);

      spinAngle += state.spinSpeed * delta * 1.6;

      const floatY = Math.sin(elapsed * 1.4) * 0.16;
      coinGroup.position.set(state.posX, state.posY + floatY, state.posZ);
      coinGroup.scale.setScalar(state.scale);
      coinGroup.rotation.y = state.faceRot + spinAngle;
      coinGroup.rotation.x = state.tiltX + Math.sin(elapsed * 0.8) * 0.06;
      coinGroup.rotation.z = state.tiltZ + Math.cos(elapsed * 0.6) * 0.05;

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      gemsGroup.rotation.x = currentMouseY;
      gemsGroup.rotation.y = currentMouseX;
      gemsGroup.position.set(state.posX * 0.4, state.posY * 0.6, 0);

      const orbit = state.orbitStrength;
      gemMeshes.forEach((mesh, idx) => {
        const u = mesh.userData;
        u.orbitAngle += u.orbitSpeed * 0.014 * (0.4 + orbit);
        const dist = (u.orbitDistance || 4.5) * (0.55 + orbit * 0.65);
        mesh.position.x = Math.cos(u.orbitAngle) * dist + Math.sin(elapsed * 1.3 + u.phaseX) * 0.4;
        mesh.position.y = u.heightOffset * (0.5 + orbit) + Math.cos(elapsed * 1.6 + u.phaseY) * 0.5;
        mesh.position.z = Math.sin(u.orbitAngle) * dist + Math.sin(elapsed * 1.8 + u.phaseZ) * 0.35;
        mesh.rotation.x = Math.sin(elapsed * 1.5 + idx) * 0.65;
        mesh.rotation.y += u.rotSpeedY;
        mesh.rotation.z = Math.cos(elapsed * 1.3 + idx) * 0.55;
        mesh.scale.setScalar(0.5 + orbit * 0.8);
        mesh.visible = orbit > 0.05;
      });

      particleSystem.rotation.y = elapsed * 0.07;
      particleSystem.rotation.z = elapsed * 0.03;
      pointLight.position.x = Math.sin(elapsed * 2) * 5;
      pointLight.position.y = Math.cos(elapsed * 1.5) * 4;

      if (handRef.current) {
        handRef.current.style.opacity = String(state.handOpacity);
        const px = (state.posX / getViewWidth()) * window.innerWidth;
        const py = (-(state.posY + floatY) / viewHeight) * window.innerHeight;
        const radiusPx = ((coinRadius * state.scale) / viewHeight) * window.innerHeight;
        handRef.current.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py + radiusPx * 0.92}px)) scale(${(radiusPx / 120).toFixed(3)})`;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      triggers.forEach((t) => t && t.kill());
      geometry.dispose();
      orbitGeo.dispose();
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [frontSrc, backSrc]);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden" data-testid="coin-canvas-3d">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none blur-3xl opacity-70" />

      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400 gap-3 z-50">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Memuat Animasi 3D...</span>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full" />

      {/* Animated hand holding the coin (Scroll 3) */}
      <div
        ref={handRef}
        className="coin-hand-layer absolute left-1/2 top-1/2 opacity-0 pointer-events-none"
        data-testid="coin-hand-visual"
        style={{ width: 300, height: 300 }}
      >
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-[0_10px_30px_rgba(16,185,129,0.35)]">
          <defs>
            <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <g fill="url(#skin)" opacity="0.92">
            <path d="M40 150c0-12 10-20 22-20h96c12 0 22 8 22 20v10c0 16-14 28-32 28H72c-18 0-32-12-32-28v-10z" />
            <rect x="56" y="104" width="26" height="52" rx="13" />
            <rect x="88" y="96" width="26" height="60" rx="13" />
            <rect x="120" y="98" width="26" height="58" rx="13" />
            <rect x="152" y="108" width="24" height="48" rx="12" />
            <path d="M34 132c-6-10 0-22 12-24l16-2 6 22-22 10c-4 2-9 0-12-6z" />
          </g>
          <ellipse cx="120" cy="186" rx="70" ry="10" fill="#10b981" opacity="0.18" />
        </svg>
      </div>

      <span className="sr-only" data-testid="active-scene">{activeScene}</span>
    </div>
  );
}
