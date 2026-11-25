import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { HeroDefinition } from '../data/gameData';
import { AnimatedRig, buildCharacterRig, disposeObject3D } from '../game/characterModels';
import { createContactShadowTexture } from '../game/textures';

interface HeroPreviewCanvasProps {
  hero: HeroDefinition;
}

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function HeroPreviewCanvas({ hero }: HeroPreviewCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rigRef = useRef<AnimatedRig | null>(null);

  const yawRef = useRef(0.25);
  const autoSpinRef = useRef(true);
  const dragRef = useRef({ active: false, lastX: 0 });
  const zoomDistRef = useRef(4.5);
  const entranceTimerRef = useRef(0);

  const [zoomPct, setZoomPct] = useState(100);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 360, container.clientHeight || 360);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      40,
      (container.clientWidth || 360) / (container.clientHeight || 360),
      0.1,
      50
    );
    camera.position.set(0, 1.9, zoomDistRef.current);
    camera.lookAt(0, 1.15, 0);

    const hemi = new THREE.HemisphereLight('#93c5fd', '#1e293b', 0.95);
    scene.add(hemi);
    const key = new THREE.DirectionalLight('#fffbeb', 1.9);
    key.position.set(3, 5, 4);
    key.castShadow = !isSoftwareGl;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#38bdf8', 1.2);
    rim.position.set(-4, 3, -3);
    scene.add(rim);

    const pedGeo = new THREE.CylinderGeometry(1.25, 1.48, 0.24, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      metalness: 0.58,
      roughness: 0.3,
    });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = -0.12;
    ped.receiveShadow = true;
    scene.add(ped);

    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      if (autoSpinRef.current && !dragRef.current.active) {
        yawRef.current += dt * 0.55;
      }

      if (entranceTimerRef.current > 0) {
        entranceTimerRef.current = Math.max(0, entranceTimerRef.current - dt);
      }

      const targetZ = zoomDistRef.current;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, Math.min(1, dt * 10));
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.3 + targetZ * 0.14, Math.min(1, dt * 10));
      camera.lookAt(0, 1.12, 0);

      if (rigRef.current) {
        const rig = rigRef.current;
        const introT = 1 - entranceTimerRef.current / 0.55;
        if (entranceTimerRef.current > 0) {
          const bounceScale = 1.08 * (0.72 + Math.sin(introT * Math.PI * 0.65) * 0.36);
          rig.root.scale.setScalar(bounceScale);
          rig.root.rotation.y = yawRef.current + (1 - introT) * Math.PI * 1.25;
          rig.rightArm.rotation.x = -1.1 * (1 - introT) + -0.25 * introT;
        } else {
          rig.root.scale.setScalar(1.08);
          rig.root.rotation.y = yawRef.current;
          rig.rightArm.rotation.x = -0.25 + Math.sin(t * 2.4) * 0.08;
        }

        rig.bodyGroup.position.y = Math.sin(t * 2.4) * 0.04;
        rig.leftArm.rotation.x = Math.cos(t * 2.4) * 0.08;
        if (rig.backOrbit) {
          rig.backOrbit.rotation.z += dt * 2.6;
        }
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      if (rigRef.current) {
        scene.remove(rigRef.current.root);
        disposeObject3D(rigRef.current.root);
        rigRef.current = null;
      }
      pedGeo.dispose();
      pedMat.dispose();
      shadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (rigRef.current) {
      scene.remove(rigRef.current.root);
      disposeObject3D(rigRef.current.root);
      rigRef.current = null;
    }
    const rig = buildCharacterRig({
      role: hero.roleId,
      primaryColor: hero.appearance.primaryColor,
      secondaryColor: hero.appearance.secondaryColor,
      accentColor: hero.appearance.accentColor,
      weaponStyle: hero.appearance.weaponStyle,
      headgear: hero.appearance.headgear,
      bodyVariant: hero.appearance.bodyVariant,
      scale: 1.08,
    });
    scene.add(rig.root);
    rigRef.current = rig;
    entranceTimerRef.current = 0.55;
  }, [hero]);

  const adjustZoom = (delta: number) => {
    const next = Math.max(2.8, Math.min(6.2, zoomDistRef.current + delta));
    zoomDistRef.current = next;
    setZoomPct(Math.round((4.5 / next) * 100));
  };

  const resetView = () => {
    zoomDistRef.current = 4.5;
    yawRef.current = 0.25;
    autoSpinRef.current = true;
    setZoomPct(100);
  };

  return (
    <div
      className="relative w-full h-full min-h-[260px] select-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        dragRef.current = { active: true, lastX: e.clientX };
        autoSpinRef.current = false;
      }}
      onPointerMove={(e) => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.lastX;
        dragRef.current.lastX = e.clientX;
        yawRef.current += dx * 0.015;
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
      onWheel={(e) => {
        e.preventDefault();
        adjustZoom(e.deltaY > 0 ? 0.35 : -0.35);
      }}
    >
      <div ref={mountRef} className="w-full h-full min-h-[260px]" />

      {/* Interactive Rotate & Zoom Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-semibold text-slate-300/90 bg-slate-950/70 px-2 py-1 rounded-md border border-white/10">
          Seret untuk putar · Skrol untuk zum
        </span>
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => adjustZoom(-0.45)}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 cursor-pointer"
            title="Zum Masuk"
            aria-label="Zum Masuk"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono-num font-bold text-amber-300 bg-slate-950/80 px-1.5 py-1 rounded border border-white/10">
            {zoomPct}%
          </span>
          <button
            type="button"
            onClick={() => adjustZoom(0.45)}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 cursor-pointer"
            title="Zum Keluar"
            aria-label="Zum Keluar"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-amber-300 cursor-pointer"
            title="Set Semula Paparan"
            aria-label="Set Semula Paparan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
