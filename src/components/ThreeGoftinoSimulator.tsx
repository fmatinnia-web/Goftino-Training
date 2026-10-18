/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ThreeGoftinoSimulatorProps {
  onEnterAgent: () => void;
  onEnterAdmin: () => void;
}

export const ThreeGoftinoSimulator: React.FC<ThreeGoftinoSimulatorProps> = ({
  onEnterAgent,
  onEnterAdmin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera & Renderer Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161618);
    scene.fog = new THREE.FogExp2(0x161618, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- 2. Studio Lighting & PMREM Environment ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cyan Accent Fill Light
    const cyanLight = new THREE.PointLight(0x00bcd4, 3.5, 12);
    cyanLight.position.set(-3.5, 1.5, 2.5);
    scene.add(cyanLight);

    // Purple Rim Light
    const purpleLight = new THREE.PointLight(0xa855f7, 2.8, 10);
    purpleLight.position.set(3.5, -1, -2);
    scene.add(purpleLight);

    // Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1e24, 0.8);
    scene.add(hemiLight);

    // --- 3. Root 3D Group ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // --- 4. Procedural Canvas Texture for Goftino UI Screen ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1536;
    screenCanvas.height = 960;
    const ctx = screenCanvas.getContext('2d')!;

    const renderGoftinoScreen = (time: number) => {
      const w = screenCanvas.width;
      const h = screenCanvas.height;

      // Dark background
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, w, h);

      // Top Status Bar (36px)
      ctx.fillStyle = '#262626';
      ctx.fillRect(0, 0, w, 44);
      ctx.fillStyle = '#383838';
      ctx.fillRect(0, 43, w, 1);

      // Top bar title
      ctx.font = 'bold 18px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText('میز کار پشتیبانی آنلاین • نسخه ۳ بعدی شبیه‌ساز', w - 24, 28);

      // Online green pill
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(60, 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '14px Vazirmatn, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'left';
      ctx.fillText('سیستم آنلاین و متصل', 74, 27);

      // Rightmost Sidebar (Width: 100px)
      const sbW = 90;
      ctx.fillStyle = '#252525';
      ctx.fillRect(w - sbW, 44, sbW, h - 44);
      ctx.fillStyle = '#333333';
      ctx.fillRect(w - sbW, 44, 1, h - 44);

      // Brand Logo "گفتینو"
      ctx.font = 'bold 22px Vazirmatn, sans-serif';
      ctx.fillStyle = '#00bcd4';
      ctx.textAlign = 'center';
      ctx.fillText('گفتینو', w - sbW / 2, 85);

      // Sidebar circular avatar
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(w - sbW / 2, 130, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('G', w - sbW / 2, 136);

      // Active Chat Icon in Sidebar (cyan box)
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.roundRect(w - sbW / 2 - 24, 180, 48, 48, 14);
      ctx.fill();
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('💬', w - sbW / 2, 212);

      // Other Sidebar Icons (Visitors, Archive, Settings)
      const sideIcons = ['👥', '📁', '⚙️'];
      sideIcons.forEach((ico, idx) => {
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.roundRect(w - sbW / 2 - 20, 245 + idx * 56, 40, 40, 10);
        ctx.fill();
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText(ico, w - sbW / 2, 270 + idx * 56);
      });

      // Chat List Column (Width: 380px)
      const listW = 380;
      const listX = w - sbW - listW;
      ctx.fillStyle = '#222222';
      ctx.fillRect(listX, 44, listW, h - 44);
      ctx.fillStyle = '#333333';
      ctx.fillRect(listX, 44, 1, h - 44);

      // List Header Tabs
      ctx.fillStyle = '#282828';
      ctx.fillRect(listX, 44, listW, 52);
      ctx.font = 'bold 17px Vazirmatn, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('گفتگوها (صف انتظار)', listX + listW - 20, 76);

      // Active Chat item 1
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.roundRect(listX + 12, 110, listW - 24, 82, 14);
      ctx.fill();
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Avatar
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(listX + listW - 48, 150, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 15px Vazirmatn, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('م', listX + listW - 48, 155);

      // Name & preview
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px Vazirmatn, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('مهسا کریمی', listX + listW - 80, 142);
      ctx.font = '13px Vazirmatn, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('سلام وقت بخیر، سفارش من ارسال شده؟', listX + listW - 80, 168);

      // Green online dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(listX + listW - 32, 164, 5, 0, Math.PI * 2);
      ctx.fill();

      // List item 2 & 3
      const mockList = [
        { name: 'علیرضا اسدی', msg: 'ممنون بابت راهنمایی خوبتون', tag: 'پایان یافته' },
        { name: 'سارا احمدی', msg: 'چطور می‌تونم سفارشم رو ویرایش کنم؟', tag: 'در انتظار' },
      ];
      mockList.forEach((item, idx) => {
        const topY = 204 + idx * 88;
        ctx.fillStyle = '#262626';
        ctx.beginPath();
        ctx.roundRect(listX + 12, topY, listW - 24, 76, 12);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(listX + listW - 48, topY + 38, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = 'right';
        ctx.font = 'bold 15px Vazirmatn, sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(item.name, listX + listW - 80, topY + 32);

        ctx.font = '13px Vazirmatn, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(item.msg, listX + listW - 80, topY + 54);
      });

      // Active Chat Main Area (Remaining space on left)
      const mainW = listX;
      ctx.fillStyle = '#1a1a1c';
      ctx.fillRect(0, 44, mainW, h - 44);

      // Chat Header in active window
      ctx.fillStyle = '#222224';
      ctx.fillRect(0, 44, mainW, 60);
      ctx.fillStyle = '#2e2e32';
      ctx.fillRect(0, 103, mainW, 1);

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(mainW - 38, 74, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px Vazirmatn, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('مهسا کریمی (کاربر وب‌سایت)', mainW - 70, 72);
      ctx.font = '12px Vazirmatn, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('● آنلاین • تهران، کروم در ویندوز ۱۱', mainW - 70, 92);

      // User Message 1 (Left aligned bubble in RTL, i.e., incoming customer)
      ctx.fillStyle = '#26262b';
      ctx.beginPath();
      ctx.roundRect(mainW - 480, 140, 440, 80, 16);
      ctx.fill();
      ctx.strokeStyle = '#383842';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '15px Vazirmatn, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText('سلام وقت بخیر، سفارش من ارسال شده؟', mainW - 30, 175);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('10:42', mainW - 30, 202);

      // Agent Reply 1 (Cyan bubble, operator reply)
      ctx.fillStyle = '#00acc1';
      ctx.beginPath();
      ctx.roundRect(40, 250, 480, 84, 16);
      ctx.fill();

      ctx.font = '15px Vazirmatn, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('سلام روزتون بخیر! بله سفارش شما تحویل پست شد.', 500, 286);
      ctx.fillText('کد رهگیری: 24819402847291', 500, 312);

      // User Message 2
      ctx.fillStyle = '#26262b';
      ctx.beginPath();
      ctx.roundRect(mainW - 420, 360, 380, 72, 16);
      ctx.fill();
      ctx.font = '15px Vazirmatn, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText('خیلی ممنون از پاسخگویی سریع‌تون! 🙏', mainW - 30, 400);

      // Live Animated Typing Indicator for User
      const dotOffset = Math.sin(time * 5) * 4;
      ctx.fillStyle = '#222226';
      ctx.beginPath();
      ctx.roundRect(mainW - 140, 455, 100, 38, 12);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const dotBounce = Math.sin(time * 6 + i * 1.2) * 3;
        ctx.fillStyle = '#00bcd4';
        ctx.beginPath();
        ctx.arc(mainW - 115 + i * 22, 474 + dotBounce, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom Message Input Box (Fixed at bottom)
      const inputY = h - 90;
      ctx.fillStyle = '#222225';
      ctx.fillRect(0, inputY, mainW, 90);
      ctx.fillStyle = '#303036';
      ctx.fillRect(0, inputY, mainW, 1);

      // Input field capsule
      ctx.fillStyle = '#18181a';
      ctx.beginPath();
      ctx.roundRect(24, inputY + 16, mainW - 48, 56, 16);
      ctx.fill();
      ctx.strokeStyle = '#3a3a42';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '15px Vazirmatn, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('پیام خود را بنویسید و کلید Enter را بزنید...', mainW - 56, inputY + 50);

      // Send Button (Cyan circle with arrow)
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.arc(58, inputY + 44, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('➤', 58, inputY + 50);
    };

    renderGoftinoScreen(0);

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // --- 5. 3D Display Device Geometry (Monitor Screen + Bezel + Stand) ---
    const monitorGroup = new THREE.Group();
    rootGroup.add(monitorGroup);

    // Beveled Outer Bezel / Chassis
    const bezelWidth = 6.4;
    const bezelHeight = 4.0;
    const bezelDepth = 0.2;
    const bezelGeom = new THREE.BoxGeometry(bezelWidth, bezelHeight, bezelDepth);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f22,
      roughness: 0.25,
      metalness: 0.85,
    });
    const bezelMesh = new THREE.Mesh(bezelGeom, bezelMat);
    bezelMesh.castShadow = true;
    bezelMesh.receiveShadow = true;
    monitorGroup.add(bezelMesh);

    // Screen Plane (with Live Goftino UI Texture)
    const screenGeom = new THREE.PlaneGeometry(bezelWidth - 0.2, bezelHeight - 0.2);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeom, screenMat);
    screenMesh.position.z = bezelDepth / 2 + 0.005;
    monitorGroup.add(screenMesh);

    // Subtle Screen Glass Layer (PBR reflections)
    const glassGeom = new THREE.PlaneGeometry(bezelWidth - 0.2, bezelHeight - 0.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 0.2,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.z = bezelDepth / 2 + 0.01;
    monitorGroup.add(glassMesh);

    // Brushed Aluminum Stand
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.95,
      roughness: 0.18,
    });
    // Stand Hinge
    const hingeGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 24);
    hingeGeom.rotateZ(Math.PI / 2);
    const hinge = new THREE.Mesh(hingeGeom, standMat);
    hinge.position.set(0, -0.6, -bezelDepth / 2 - 0.1);
    monitorGroup.add(hinge);

    // Stand Neck
    const neckGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 24);
    const neck = new THREE.Mesh(neckGeom, standMat);
    neck.position.set(0, -1.5, -0.4);
    neck.rotation.x = 0.12;
    neck.castShadow = true;
    monitorGroup.add(neck);

    // Stand Circular Base
    const baseGeom = new THREE.CylinderGeometry(1.3, 1.35, 0.08, 48);
    const base = new THREE.Mesh(baseGeom, standMat);
    base.position.set(0, -2.48, -0.15);
    base.receiveShadow = true;
    monitorGroup.add(base);

    // --- 6. Floating 3D Elements Around the Display ---
    // A. 3D Floating Speech Bubble (Left Side)
    const bubbleGroup = new THREE.Group();
    bubbleGroup.position.set(-3.8, 1.2, 0.8);
    rootGroup.add(bubbleGroup);

    const bubbleShape = new THREE.Shape();
    const bw = 1.6;
    const bh = 1.1;
    const br = 0.35;
    bubbleShape.moveTo(-bw / 2 + br, -bh / 2);
    bubbleShape.lineTo(bw / 2 - br, -bh / 2);
    bubbleShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
    bubbleShape.lineTo(bw / 2, bh / 2 - br);
    bubbleShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
    bubbleShape.lineTo(-bw / 2 + br, bh / 2);
    bubbleShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
    bubbleShape.lineTo(-bw / 2, -bh / 2 + br);
    bubbleShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 6, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const bubbleGeom = new THREE.ExtrudeGeometry(bubbleShape, extrudeSettings);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x00bcd4,
      emissive: 0x006677,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.25,
      transparent: true,
      opacity: 0.92,
    });
    const bubbleMesh = new THREE.Mesh(bubbleGeom, bubbleMat);
    bubbleMesh.castShadow = true;
    bubbleGroup.add(bubbleMesh);

    // 3 Glowing Dots inside speech bubble
    const dotsGroup = new THREE.Group();
    dotsGroup.position.set(0, 0, 0.2);
    bubbleGroup.add(dotsGroup);

    const dots: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const dotGeom = new THREE.SphereGeometry(0.08, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dotMesh = new THREE.Mesh(dotGeom, dotMat);
      dotMesh.position.x = -0.36 + i * 0.36;
      dotsGroup.add(dotMesh);
      dots.push(dotMesh);
    }

    // B. 3D Floating Notification Orb & Orbiting Rings (Right Side)
    const orbGroup = new THREE.Group();
    orbGroup.position.set(3.8, 1.4, 0.6);
    rootGroup.add(orbGroup);

    const coreOrbGeom = new THREE.SphereGeometry(0.45, 32, 32);
    const coreOrbMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    });
    const coreOrb = new THREE.Mesh(coreOrbGeom, coreOrbMat);
    orbGroup.add(coreOrb);

    const ringGeom1 = new THREE.TorusGeometry(0.75, 0.025, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00bcd4 });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    orbGroup.add(ring1);

    const ringGeom2 = new THREE.TorusGeometry(0.9, 0.02, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    orbGroup.add(ring2);

    // C. 3D Ground Hologram Radial Grid
    const groundGroup = new THREE.Group();
    groundGroup.position.set(0, -2.52, 0);
    scene.add(groundGroup);

    // Radial Grid Rings
    for (let r = 1; r <= 6; r++) {
      const ringGeom = new THREE.RingGeometry(r * 0.85, r * 0.85 + 0.02, 64);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00bcd4,
        transparent: true,
        opacity: Math.max(0.04, 0.35 - r * 0.05),
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      groundGroup.add(ring);
    }

    // Soft Radial Contact Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlaneGeom = new THREE.PlaneGeometry(6, 6);
    shadowPlaneGeom.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.position.y = 0.005;
    groundGroup.add(shadowPlane);

    // Floating Data Particle Field
    const particleCount = 80;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // --- 7. Interactive Mouse / Touch Orbit Controls with Damping ---
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let lastRenderUpdate = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDown = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDown) {
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        targetRotationY += deltaX * 0.005;
        targetRotationX += deltaY * 0.003;
        targetRotationX = Math.max(-0.35, Math.min(0.45, targetRotationX));
        startX = clientX;
        startY = clientY;
      } else {
        // Subtle tilt when hovering
        const nx = (clientX / window.innerWidth - 0.5) * 2;
        const ny = (clientY / window.innerHeight - 0.5) * 2;
        targetRotationY = nx * 0.25;
        targetRotationX = ny * 0.15;
      }
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // --- 8. Window Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 9. Smooth Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous subtle idle float oscillation
      const idleFloatY = Math.sin(elapsedTime * 1.5) * 0.08;
      const idleRotateY = !isPointerDown ? Math.sin(elapsedTime * 0.5) * 0.12 : 0;

      // Exponential damping towards target rotation
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY + idleRotateY, 6, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 6, delta);

      rootGroup.rotation.y = currentRotationY;
      rootGroup.rotation.x = currentRotationX;
      monitorGroup.position.y = idleFloatY;

      // Floating Speech Bubble bobbing & rotating
      bubbleGroup.position.y = 1.2 + Math.sin(elapsedTime * 2.2) * 0.12;
      bubbleGroup.rotation.y = Math.sin(elapsedTime * 1.4) * 0.2;

      // Dots bounce
      dots.forEach((dot, idx) => {
        dot.position.y = Math.sin(elapsedTime * 6 + idx * 1.2) * 0.06;
      });

      // Notification Orb spin
      ring1.rotation.x += delta * 1.2;
      ring1.rotation.y += delta * 0.8;
      ring2.rotation.z += delta * 1.0;
      orbGroup.position.y = 1.4 + Math.cos(elapsedTime * 2.0) * 0.12;

      // Periodically redraw screen canvas typing dots (throttled to 20fps for performance)
      if (elapsedTime - lastRenderUpdate > 0.05) {
        renderGoftinoScreen(elapsedTime);
        screenTexture.needsUpdate = true;
        lastRenderUpdate = elapsedTime;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 10. Clean Cleanup on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      // Dispose Geometries and Materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      screenTexture.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none font-['Vazirmatn',sans-serif]">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Bottom Center Ergonomic Role Entry Dock (Following Skill Layout Guidelines) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto">
        <div className="bg-[#1e1e22]/90 border border-[#3e3e46] rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Agent Entry */}
            <button
              type="button"
              onClick={onEnterAgent}
              className="py-3 px-4 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-600/20 to-[#00bcd4]/10 hover:from-cyan-500 hover:to-cyan-600 hover:text-white text-cyan-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
            >
              <span className="text-base">🎧</span>
              <span>ورود کارشناس پشتیبانی</span>
            </button>

            {/* 2. Admin Entry */}
            <button
              type="button"
              onClick={onEnterAdmin}
              className="py-3 px-4 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600/20 to-purple-800/10 hover:from-purple-600 hover:to-purple-700 hover:text-white text-purple-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
            >
              <span className="text-base">🛡️</span>
              <span>ورود مدیریت آموزش</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
