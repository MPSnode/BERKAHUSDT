import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RefreshCw } from 'lucide-react';

export default function CoinCanvas3D() {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFace, setCurrentFace] = useState('BERKAH USDT (Depan)');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Fullscreen Scene & Camera Setup
    const scene = new THREE.Scene();
    let width = window.innerWidth;
    let height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Scene Groups
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const coinGroup = new THREE.Group();
    mainGroup.add(coinGroup);

    // 4. Texture Loader
    const textureLoader = new THREE.TextureLoader();

    const frontTexture = textureLoader.load('/coin_front.png', () => {
      setIsLoaded(true);
    });
    const backTexture = textureLoader.load('/coin_back.png');

    [frontTexture, backTexture].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.center.set(0.5, 0.5);
    });

    frontTexture.rotation = Math.PI / 2;
    backTexture.rotation = 0;

    // 5. Coin Geometry & Metallic Materials
    const coinRadius = 2.7;
    const coinThickness = 0.35;
    const geometry = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 96);

    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xDAA520,
      metalness: 0.95,
      roughness: 0.15,
      bumpScale: 0.05
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.35,
      roughness: 0.25,
      transparent: true
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.35,
      roughness: 0.25,
      transparent: true
    });

    const materials = [sideMaterial, frontMaterial, backMaterial];
    const coinMesh = new THREE.Mesh(geometry, materials);
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // 6. Orbiting Official 3D Crypto Coins (XRP, DOGE, SOL, ETH, TRX, BTC, USDT)
    const gemsGroup = new THREE.Group();
    mainGroup.add(gemsGroup);

    const orbitCryptoCoins = [
      { name: 'XRP', textureUrl: '/coin_xrp.png' },
      { name: 'DOGE', textureUrl: '/coin_doge.png' },
      { name: 'SOL', textureUrl: '/coin_sol.png' },
      { name: 'ETH', textureUrl: '/coin_eth.png' },
      { name: 'TRX', textureUrl: '/coin_trx.png' },
      { name: 'SHIB', textureUrl: '/coin_shib.png' },
      { name: 'USDT', textureUrl: '/coin_back.png' },
    ];

    const gemMeshes = [];
    const orbitCoinRadius = 0.58;
    const orbitCoinThickness = 0.09;
    const orbitCoinGeo = new THREE.CylinderGeometry(orbitCoinRadius, orbitCoinRadius, orbitCoinThickness, 32);

    const orbitCoinSideMat = new THREE.MeshStandardMaterial({
      color: 0xDAA520,
      metalness: 0.95,
      roughness: 0.15
    });

    orbitCryptoCoins.forEach((coin, i) => {
      const tex = textureLoader.load(coin.textureUrl);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.center.set(0.5, 0.5);

      const faceMat = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.35,
        roughness: 0.25,
        transparent: true
      });

      const materials = [orbitCoinSideMat, faceMat, faceMat];
      const coinMesh = new THREE.Mesh(orbitCoinGeo, materials);
      coinMesh.rotation.x = Math.PI / 2;

      const angle = (i / orbitCryptoCoins.length) * Math.PI * 2;
      const distance = 4.3 + (i % 3) * 0.7;
      const heightOffset = (Math.random() - 0.5) * 3.5;

      coinMesh.position.set(
        Math.cos(angle) * distance,
        heightOffset,
        Math.sin(angle) * distance
      );

      coinMesh.userData = {
        name: coin.name,
        orbitAngle: angle,
        orbitSpeed: 0.25 + (i % 3) * 0.12,
        orbitDistance: distance,
        heightOffset: heightOffset,
        rotSpeedY: 0.02 + Math.random() * 0.03,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2
      };

      gemsGroup.add(coinMesh);
      gemMeshes.push(coinMesh);
    });

    // Mouse Parallax Motion Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = x * 0.4;
      targetMouseY = y * 0.3;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // 7. Fullscreen 3D Starfield & Particle Matrix
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorEmerald = new THREE.Color(0x00E676);
    const colorGold = new THREE.Color(0xFFD700);

    for (let i = 0; i < particleCount; i++) {
      const radius = 4.0 + Math.random() * 12.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi);
      particlePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const mixColor = Math.random() > 0.5 ? colorEmerald : colorGold;
      particleColors[i * 3] = mixColor.r;
      particleColors[i * 3 + 1] = mixColor.g;
      particleColors[i * 3 + 2] = mixColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // 8. Multi-Source Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffd700, 3.0); // Gold directional light
    dirLight1.position.set(6, 10, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00e676, 2.5); // Emerald directional light
    dirLight2.position.set(-6, -8, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00e676, 2.5, 15);
    pointLight.position.set(0, 0, 7);
    scene.add(pointLight);

    // 9. Fullscreen Multi-Axis 3D Trajectory State Variables
    let scrollRotationY = 0;
    let scrollRotationX = 0;
    let scrollRotationZ = 0;

    let targetScrollRotY = 0;
    let targetScrollRotX = 0;
    let targetScrollRotZ = 0;

    let currentScale = 1;
    let targetScale = 1;

    let currentPosX = 0;
    let targetPosX = 0;

    let currentPosY = 0;
    let targetPosY = 0;

    let currentPosZ = 0;
    let targetPosZ = 0;

    // Fullscreen Scroll Handler
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollPercent = scrollY / maxScroll;

      // 1. Y-Axis (Spin 360°): 8 full 360° rotations across total scroll
      targetScrollRotY = scrollPercent * Math.PI * 16;

      // 2. X-Axis (Pitch Tilt Up/Down Wave)
      targetScrollRotX = Math.sin(scrollPercent * Math.PI * 6) * 0.5;

      // 3. Z-Axis (Roll Diagonal Tilt Wave)
      targetScrollRotZ = Math.cos(scrollPercent * Math.PI * 4) * 0.4;

      // 4. 3D Space Trajectory (X/Y/Z Screen Translation)
      targetPosX = Math.sin(scrollPercent * Math.PI * 3) * 3.2;
      targetPosY = Math.cos(scrollPercent * Math.PI * 5) * 0.6;
      targetPosZ = Math.sin(scrollPercent * Math.PI * 2) * 1.5;

      // 5. Dynamic Scale Morphing
      targetScale = 1 + Math.sin(scrollPercent * Math.PI * 3) * 0.2;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Fullscreen Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. High-FPS Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Lerp Interpolation
      scrollRotationY += (targetScrollRotY - scrollRotationY) * 0.07;
      scrollRotationX += (targetScrollRotX - scrollRotationX) * 0.07;
      scrollRotationZ += (targetScrollRotZ - scrollRotationZ) * 0.07;
      currentScale += (targetScale - currentScale) * 0.07;

      currentPosX += (targetPosX - currentPosX) * 0.07;
      currentPosY += (targetPosY - currentPosY) * 0.07;
      currentPosZ += (targetPosZ - currentPosZ) * 0.07;

      // Position & Scale
      const floatOffsetY = Math.sin(elapsedTime * 1.5) * 0.18;
      coinGroup.position.set(currentPosX, currentPosY + floatOffsetY, currentPosZ);
      coinGroup.scale.set(currentScale, currentScale, currentScale);

      // Mouse Parallax Damping
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      gemsGroup.rotation.x = currentMouseY;
      gemsGroup.rotation.y = currentMouseX;

      // Multi-Directional Organic 3D Floating & Rotations (Horizontal, Vertical, Diagonal, Z-Depth)
      gemMeshes.forEach((coinMesh, idx) => {
        const u = coinMesh.userData;

        // 1. Orbit Angle Progress
        u.orbitAngle += u.orbitSpeed * 0.014;

        // 2. Multi-Directional Wave Oscillations (Horizontal, Vertical, Diagonal, Z-Depth)
        const baseDist = u.orbitDistance || 4.5;

        // Horizontal wave oscillation (Left <-> Right)
        const waveX = Math.sin(elapsedTime * 1.3 + u.phaseX) * 0.45;
        // Vertical wave oscillation (Up <-> Down)
        const waveY = Math.cos(elapsedTime * 1.6 + u.phaseY) * 0.55;
        // Z-Depth oscillation (Forward <-> Backward)
        const waveZ = Math.sin(elapsedTime * 1.8 + u.phaseZ) * 0.4;

        coinMesh.position.x = Math.cos(u.orbitAngle) * baseDist + waveX;
        coinMesh.position.y = u.heightOffset + waveY;
        coinMesh.position.z = Math.sin(u.orbitAngle) * baseDist + waveZ;

        // 3. Multi-Axis 3D Rotations (Pitch top/bottom, Yaw left/right, Roll diagonal)
        coinMesh.rotation.x = Math.sin(elapsedTime * 1.5 + idx) * 0.65; // Pitch tilt top-to-bottom
        coinMesh.rotation.y += u.rotSpeedY;                              // Main Y-spin
        coinMesh.rotation.z = Math.cos(elapsedTime * 1.3 + idx) * 0.55; // Roll tilt diagonal
      });

      // Rotate particle matrix slowly
      particleSystem.rotation.y = elapsedTime * 0.07;
      particleSystem.rotation.z = elapsedTime * 0.03;

      // Dynamic lighting motion
      pointLight.position.x = Math.sin(elapsedTime * 2) * 5;
      pointLight.position.y = Math.cos(elapsedTime * 1.5) * 4;

      // Rotations
      coinGroup.rotation.y = scrollRotationY;
      coinGroup.rotation.x = scrollRotationX;
      coinGroup.rotation.z = scrollRotationZ;

      // Face check
      const totalRotY = (coinGroup.rotation.y % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      if (totalRotY > Math.PI * 0.5 && totalRotY < Math.PI * 1.5) {
        setCurrentFace('USDT Tether (Belakang)');
      } else {
        setCurrentFace('BERKAH USDT (Depan)');
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden">
      {/* Radial Background Glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none blur-3xl opacity-70" />

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400 gap-3 z-50">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Memuat Fullscreen 3D Scene...</span>
        </div>
      )}

      {/* Fullscreen Three.js WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
