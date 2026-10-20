/**
 * Escena three.js del primer plano de AETHER-02.
 *
 * El canvas se renderiza con alfa para respetar la regla de "robot sin
 * recuadro": no hay fondo opaco, sólo un charco de luz suave que se mezcla con
 * el degradado de la portada.
 */

import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PointLight,
  Box3,
  Scene,
  SkinnedMesh,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
  HalfFloatType,
  type Object3D,
  type Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { AetherRig } from "./aetherRig";
import { PsychedelicShader } from "./psychedelicShader";
import {
  composeLook,
  createPose,
  damp,
  pointerToLook,
  type AetherPose,
  type LookOffset,
} from "./aetherPose";

export const MODEL_URL = "/assets/models/aether-02.glb";

/** Paleta de la demo de agentes, igual que el resto de la portada. */
const CYAN = 0x42c7e8;
const BLUE = 0x287ff0;
const MAGENTA = 0xff3dd0;

/**
 * Encuadre: rostro, cuello y parte superior de los hombros.
 *
 * El plano se ancla en la coronilla del casco, que se mide del propio modelo
 * en vez de darla por supuesta: así el aire de arriba es un número explícito
 * y no el residuo de sumar desplazamientos a ojo.
 */
const FRAMING = {
  fov: 34,
  /** Altura visible en reposo, en unidades del modelo. Menos = más grande. */
  verticalSpan: 3.13,
  /**
   * Dónde cae la coronilla en coordenadas normalizadas de pantalla, donde 1 es
   * el borde superior del canvas. 0,90 deja un 5 % de aire: lo justo para que
   * el casco no toque el borde ni cuando el torso se acerca al final.
   */
  crownNdc: 0.9,
  offsetX: 0.1,
};

export interface AetherSceneHandle {
  readonly rig: AetherRig;
  readonly pose: AetherPose;
  /** Avisos reales del modelo detectados al cargar. */
  readonly warnings: string[];
  setEffectsEnabled(enabled: boolean): void;
  setGlitch(amount: number): void;
  /**
   * Puntero normalizado (-1..1) sobre el contenedor. `null` lo devuelve al
   * centro, por ejemplo cuando el cursor sale de la portada.
   */
  setPointer(nx: number | null, ny?: number): void;
  /** Dibuja un único fotograma con la pose actual, sin abrir el bucle. */
  renderOnce(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

interface SceneOptions {
  container: HTMLElement;
  /** Se invoca en cada fotograma antes de renderizar. */
  onFrame?: (dt: number, elapsed: number) => void;
}

export async function createAetherScene({
  container,
  onFrame,
}: SceneOptions): Promise<AetherSceneHandle> {
  const warnings: string[] = [];

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(new Color(0x000000), 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FRAMING.fov, 1, 0.1, 100);

  // Entorno procedural: da reflejos al acero sin descargar un HDR.
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.55;

  scene.add(new AmbientLight(0xffffff, 0.18));

  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(3.5, 6, 7);
  scene.add(key);

  const fill = new DirectionalLight(BLUE, 0.9);
  fill.position.set(-5, 2, 4);
  scene.add(fill);

  const rimCyan = new PointLight(CYAN, 90, 24, 2);
  scene.add(rimCyan);

  const rimMagenta = new PointLight(MAGENTA, 55, 22, 2);
  scene.add(rimMagenta);

  // --- Modelo ---------------------------------------------------------------
  // El GLB viene comprimido con EXT_meshopt_compression y texturas WebP
  // (EXT_texture_webp, que GLTFLoader ya entiende sin ayuda). El decodificador
  // de meshopt son ~20 KB de WASM y se descarga junto a three, no en el
  // bundle inicial; Draco habría costado bastante más.
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;

  let skinned: SkinnedMesh | null = null;
  const visorMaterials: MeshStandardMaterial[] = [];
  const baseEmissive = new Map<MeshStandardMaterial, number>();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  model.traverse((node) => {
    if ((node as SkinnedMesh).isSkinnedMesh) skinned = node as SkinnedMesh;
    const mesh = node as Mesh;
    if (!mesh.isMesh && !(node as SkinnedMesh).isSkinnedMesh) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue;

      // Primer plano: subimos el filtrado anisotrópico porque las texturas
      // cubren los 14 m del mecha y aquí sólo se ve la cabeza.
      for (const slot of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"] as const) {
        const texture = material[slot] as Texture | null;
        if (texture) {
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        }
      }

      const name = material.name.toLowerCase();
      if (name.includes("smoked glass") || name.includes("reactor emission")) {
        visorMaterials.push(material);
        baseEmissive.set(material, material.emissiveIntensity);
      }
    }
  });

  if (!skinned) warnings.push("El GLB no expone una malla con skinning.");
  if (visorMaterials.length === 0) warnings.push("No se encontró el material emisivo del visor.");

  const rig = new AetherRig(model);
  if (!rig.isUsable) warnings.push("No se encontró el hueso `head`; la animación de cuello no es posible.");
  if (rig.missingBones.length > 0) warnings.push(`Huesos ausentes: ${rig.missingBones.join(", ")}.`);

  // El GLB trae 11 clips que mueven los 18 huesos, incluida la traslación de
  // `root`. Pelearían con la pose procedural, así que no se monta el mixer.
  rig.reset();
  scene.add(model);

  const halfHeight = FRAMING.verticalSpan / 2;
  const distance = halfHeight / Math.tan((FRAMING.fov * Math.PI) / 360);

  // La cámara mira recto, sin inclinación, así que mover el encuadre es mover
  // su Y. El punto más alto se mide proyectando la silueta ya deformada por
  // los huesos: la caja del modelo no vale, porque su techo está detrás y la
  // coronilla, al quedar más cerca de la cámara, proyecta bastante más arriba.
  const center = new Vector3(FRAMING.offsetX, model.position.y, 0);

  const placeCamera = (y: number) => {
    center.y = y;
    camera.position.set(center.x, y, distance);
    camera.lookAt(center.x, y, 0);
    camera.updateProjectionMatrix();
  };

  placeCamera(new Box3().setFromObject(model).max.y - FRAMING.crownNdc * halfHeight);

  // Dos correcciones bastan: la primera coloca la silueta y la segunda ajusta
  // el residuo que deja la perspectiva al cambiar de altura.
  for (let pass = 0; pass < 2; pass += 1) {
    const topNdc = measureTopNdc(model, camera);
    if (!Number.isFinite(topNdc)) break;
    placeCamera(center.y + (topNdc - FRAMING.crownNdc) * halfHeight);
  }

  rimCyan.position.set(-3.2, center.y + 1.4, -1.6);
  rimMagenta.position.set(3.4, center.y - 0.6, -1.8);

  // --- Postprocesado --------------------------------------------------------
  // EffectComposer renderiza a un target propio, donde el antialiasing del
  // renderer no se aplica: sin multimuestreo el robot sale con los bordes
  // dentados y el conjunto se ve blando. Se pide MSAA explícitamente.
  const drawingBuffer = renderer.getDrawingBufferSize(new Vector2());
  const composerTarget = new WebGLRenderTarget(drawingBuffer.x, drawingBuffer.y, {
    type: HalfFloatType,
    samples: 4,
  });

  const composer = new EffectComposer(renderer, composerTarget);
  composer.addPass(new RenderPass(scene, camera));

  const afterimage = new AfterimagePass(0);
  composer.addPass(afterimage);

  const psychedelic = new ShaderPass(PsychedelicShader);
  psychedelic.uniforms.uCyan.value = new Color(CYAN);
  psychedelic.uniforms.uMagenta.value = new Color(MAGENTA);
  composer.addPass(psychedelic);
  composer.addPass(new OutputPass());

  // --- Bucle ----------------------------------------------------------------
  const pose = createPose();
  // Pose efectiva = guión + seguimiento del cursor. Se reutiliza el objeto
  // para no asignar memoria en cada fotograma.
  const composed = createPose();
  const look: LookOffset = { yaw: 0, pitch: 0 };
  let lookTarget: LookOffset = { yaw: 0, pitch: 0 };
  const clock = new Clock(false);
  let effectsEnabled = true;
  let glitch = 0;
  let frameId: number | null = null;
  let visible = true;

  function resize() {
    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
    composer.setSize(clientWidth, clientHeight);
    psychedelic.uniforms.uAspect.value = camera.aspect;
  }

  function renderFrame() {
    frameId = requestAnimationFrame(renderFrame);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 1 / 20);
    const elapsed = clock.elapsedTime;

    onFrame?.(dt, elapsed);

    // El seguimiento se amortigua en el tiempo, no por fotograma.
    look.yaw = damp(look.yaw, lookTarget.yaw, 5.5, dt);
    look.pitch = damp(look.pitch, lookTarget.pitch, 5.5, dt);

    rig.apply(composeLook(pose, look, composed), dt);

    for (const material of visorMaterials) {
      const base = baseEmissive.get(material) ?? material.emissiveIntensity;
      material.emissiveIntensity = base * pose.visorGain;
    }

    if (effectsEnabled) {
      // Los efectos nacen de la velocidad real de la cabeza y se apagan solos
      // cuando el robot frena.
      psychedelic.uniforms.uAberration.value = rig.energy * 0.009 + glitch * 0.007;
      psychedelic.uniforms.uGlitch.value = glitch;
      psychedelic.uniforms.uTime.value = elapsed;
      psychedelic.uniforms.uEnergy.value = rig.energy;
      // Rastro corto: por encima de ~0,45 el fotograma acumulado lee como
      // desenfoque en vez de como estela.
      afterimage.uniforms.damp.value = Math.min(0.45, rig.energy * 0.6);
      composer.render(dt);
    } else {
      renderer.render(scene, camera);
    }
  }

  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { threshold: 0.01 },
  );
  intersectionObserver.observe(container);

  function handleContextLost(event: Event) {
    event.preventDefault();
    warnings.push("El navegador perdió el contexto WebGL.");
  }
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

  return {
    rig,
    pose,
    warnings,
    setEffectsEnabled(enabled) {
      effectsEnabled = enabled;
      if (!enabled) {
        afterimage.uniforms.damp.value = 0;
        psychedelic.uniforms.uAberration.value = 0;
        psychedelic.uniforms.uGlitch.value = 0;
      }
    },
    setGlitch(amount) {
      glitch = amount;
    },
    setPointer(nx, ny = 0) {
      lookTarget = nx === null ? { yaw: 0, pitch: 0 } : pointerToLook(nx, ny);
    },
    renderOnce() {
      resize();
      rig.apply(composeLook(pose, look, composed), 1 / 60);
      for (const material of visorMaterials) {
        const base = baseEmissive.get(material) ?? material.emissiveIntensity;
        material.emissiveIntensity = base * pose.visorGain;
      }
      renderer.render(scene, camera);
    },
    start() {
      if (frameId !== null) return;
      clock.start();
      frameId = requestAnimationFrame(renderFrame);
    },
    stop() {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
      clock.stop();
    },
    dispose() {
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);

      scene.traverse((node) => {
        const mesh = node as Mesh;
        if (!mesh.isMesh && !(node as SkinnedMesh).isSkinnedMesh) return;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          if (!material) continue;
          for (const value of Object.values(material)) {
            if (value && typeof value === "object" && "isTexture" in value) {
              (value as Texture).dispose();
            }
          }
          material.dispose();
        }
      });

      environment.texture.dispose();
      pmrem.dispose();
      composer.dispose();
      composerTarget.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/**
 * Coordenada normalizada más alta que ocupa el modelo en pantalla, con el
 * skinning aplicado. Recorre los vértices una sola vez al cargar; es lo único
 * que da la posición real de la coronilla, porque depende tanto de su altura
 * como de su distancia a la cámara.
 */
function measureTopNdc(root: Object3D, camera: PerspectiveCamera): number {
  const vertex = new Vector3();
  let top = Number.NEGATIVE_INFINITY;

  root.updateWorldMatrix(true, true);

  root.traverse((node) => {
    const mesh = node as SkinnedMesh;
    if (!mesh.isSkinnedMesh) return;

    const positions = mesh.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i += 1) {
      vertex.fromBufferAttribute(positions, i);
      mesh.applyBoneTransform(i, vertex);
      mesh.localToWorld(vertex);
      vertex.project(camera);
      if (vertex.y > top) top = vertex.y;
    }
  });

  return top;
}
