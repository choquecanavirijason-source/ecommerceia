/**
 * Escena del robot de la portada.
 *
 * La cámara es ortográfica y está dimensionada en píxeles del contenedor, de
 * modo que una coordenada del mundo equivale a una coordenada del DOM (con la
 * Y invertida). Gracias a eso, "ve a tocar el punto de la i" se resuelve
 * leyendo el `getBoundingClientRect` de esa letra, sin proyecciones ni
 * conversiones a mano.
 *
 * El canvas se renderiza con alfa: va superpuesto al hero y no debe tapar ni
 * el degradado ni el texto.
 */

import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  CanvasTexture,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  OrthographicCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const MODEL_URL = "/assets/models/ai-robot.glb";

const CYAN = 0x42c7e8;
const BLUE = 0x287ff0;

/** Alto del robot en pantalla, en píxeles, a escala 1. */
const ALTO_PX = 300;

export interface RobotPose {
  /** Posición del robot en píxeles del contenedor. */
  x: number;
  y: number;
  /** Giro sobre su eje vertical, en radianes. */
  giro: number;
  /** Inclinación hacia donde señala, en radianes. */
  inclinacion: number;
  /** Ladeo de cabeza, en radianes: el gesto de estar pensando. */
  ladeo: number;
  /** 0 brazo en reposo, 1 brazo estirado al frente. */
  alcance: number;
  /** Giro de las ruedas, en radianes: rodar sin desplazarse. */
  rueda: number;
  /** Respiración: subida y bajada mínima del cuerpo, en píxeles. */
  respira: number;
  /** Escala relativa, para el acercamiento al tocar. */
  escala: number;
}

export interface RobotSceneHandle {
  readonly pose: RobotPose;
  /** Puntero normalizado -1..1 respecto al hero. `null` lo suelta. */
  setPointer(nx: number | null, ny?: number): void;
  /** Avisos reales detectados al cargar. */
  readonly warnings: string[];
  start(): void;
  stop(): void;
  renderOnce(): void;
  dispose(): void;
}

export function crearPoseInicial(): RobotPose {
  return { x: 0, y: 0, giro: 0, inclinacion: 0, ladeo: 0, alcance: 0, rueda: 0, respira: 0, escala: 1 };
}

export async function createRobotScene({
  container,
  onFrame,
}: {
  container: HTMLElement;
  onFrame?: (dt: number, elapsed: number) => void;
}): Promise<RobotSceneHandle> {
  const warnings: string[] = [];

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(new Color(0x000000), 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  // Se ajusta en `resize`; los valores iniciales sólo evitan una cámara nula.
  const camera = new OrthographicCamera(0, 1, 0, -1, -2000, 2000);
  camera.position.z = 500;

  scene.add(new AmbientLight(0xffffff, 1.1));

  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(260, 320, 420);
  scene.add(key);

  const fill = new DirectionalLight(BLUE, 1.1);
  fill.position.set(-320, 120, 260);
  scene.add(fill);

  const rim = new PointLight(CYAN, 1.4, 1400, 1.4);
  rim.position.set(-120, 220, 240);
  scene.add(rim);

  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  const modelo = gltf.scene;

  // El GLB mide 0,37 unidades: se escala a píxeles y se recentra sobre su
  // base, para que girar e inclinarse no lo descoloquen.
  const caja = new Box3().setFromObject(modelo);
  const tamano = caja.getSize(new Vector3());
  const escalaBase = ALTO_PX / (tamano.y || 1);
  modelo.scale.setScalar(escalaBase);
  const centro = caja.getCenter(new Vector3()).multiplyScalar(escalaBase);
  // Anclado por los pies, no por el centro: el origen del pivote es el suelo,
  // así la sombra cae donde toca y crecer no lo despega del piso.
  modelo.position.set(-centro.x, -caja.min.y * escalaBase, -centro.z);

  const pivote = new Group();
  pivote.add(modelo);

  // Piso imaginario: una mancha de contacto bajo los pies. Sin ella el robot
  // parecía flotar sobre el degradado.
  const sombra = new Mesh(new CircleGeometry(ALTO_PX * 0.42, 48), new MeshBasicMaterial({
    map: crearTexturaSombra(),
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    opacity: 0.55,
  }));
  // Tumbada y achatada: se ve en escorzo, como un suelo visto casi de frente.
  sombra.rotation.x = -Math.PI / 2.35;
  sombra.position.y = 2;
  sombra.scale.y = 0.55;
  pivote.add(sombra);

  scene.add(pivote);

  // Los brazos son nodos propios del modelo (viene en 25 piezas con nombre),
  // así que se pueden mover sin esqueleto.
  const brazos: Object3D[] = [];
  let reposoBrazo = 0;
  modelo.traverse(nodo => {
    if (/^(Left|Right)Arm/i.test(nodo.name) && nodo.parent === modelo) brazos.push(nodo);
  });
  if (brazos.length === 0) {
    // Según cómo exporte Sketchfab, los brazos pueden colgar un nivel más
    // abajo; se busca otra vez sin exigir que sean hijos directos.
    modelo.traverse(nodo => {
      if (/^(Left|Right)Arm/i.test(nodo.name)) brazos.push(nodo);
    });
  }
  if (brazos.length === 0) warnings.push("No se encontraron los brazos del robot; el gesto de alcance no se aplicará.");
  else reposoBrazo = brazos[0].rotation.x;

  // Las ruedas también son nodos propios: giran sin que el robot se desplace,
  // que es lo que hace creíble que se mueva sobre un suelo.
  const ruedas: Object3D[] = [];
  modelo.traverse(nodo => {
    if (/^(Left|Right)Wheel/i.test(nodo.name)) ruedas.push(nodo);
  });
  const reposoRueda = ruedas.map(rueda => rueda.rotation.x);
  if (ruedas.length === 0) warnings.push("No se encontraron las ruedas del robot.");

  const pose = crearPoseInicial();
  const clock = new Clock(false);

  // --- Seguimiento del cursor ------------------------------------------------
  // Se guarda el objetivo y se persigue con suavizado: saltar al valor del
  // puntero en cada evento daba un movimiento nervioso, nada mecánico.
  const puntero = { objetivoX: 0, objetivoY: 0, x: 0, y: 0, activo: false };

  // --- Equilibrio -------------------------------------------------------------
  // El modelo es un robot de dos ruedas: se sostiene como un péndulo
  // invertido, así que nunca está del todo quieto. Dos oscilaciones de
  // periodo distinto evitan que la corrección se lea como un bucle.
  const equilibrio = { inclinacion: 0, ladeo: 0, rueda: 0 };

  function actualizarEquilibrio(elapsed: number) {
    const vaiven = Math.sin(elapsed * 2.1) * 0.012 + Math.sin(elapsed * 3.7) * 0.006;
    equilibrio.inclinacion = vaiven;
    equilibrio.ladeo = Math.sin(elapsed * 1.6) * 0.009;
    // Las ruedas corrigen en sentido contrario al cuerpo, que es como un
    // robot de este tipo se mantiene en pie.
    equilibrio.rueda = -vaiven * 5.5;
  }
  let frameId: number | null = null;
  let visible = true;

  function resize() {
    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;
    // Mundo en píxeles: X hacia la derecha, Y hacia abajo en negativo.
    camera.left = 0;
    camera.right = clientWidth;
    camera.top = 0;
    camera.bottom = -clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }

  function aplicarPose() {
    pivote.position.set(pose.x, -pose.y + pose.respira, 0);
    // La pose de la coreografía, el equilibrio y el puntero se suman: así el
    // robot sigue al cursor sin dejar de hacer lo suyo.
    pivote.rotation.set(
      pose.inclinacion + equilibrio.inclinacion + puntero.y * 0.1,
      pose.giro + puntero.x * 0.32,
      pose.ladeo + equilibrio.ladeo,
    );
    pivote.scale.setScalar(pose.escala);
    for (const brazo of brazos) {
      brazo.rotation.x = reposoBrazo - pose.alcance * 1.15;
    }
    for (const [i, rueda] of ruedas.entries()) {
      rueda.rotation.x = reposoRueda[i] + pose.rueda + equilibrio.rueda;
    }
  }

  function renderFrame() {
    frameId = requestAnimationFrame(renderFrame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 1 / 20);
    actualizarEquilibrio(clock.elapsedTime);
    // Persecución exponencial: independiente de los fotogramas por segundo.
    const seguimiento = 1 - Math.exp(-dt / 0.22);
    puntero.x += ((puntero.activo ? puntero.objetivoX : 0) - puntero.x) * seguimiento;
    puntero.y += ((puntero.activo ? puntero.objetivoY : 0) - puntero.y) * seguimiento;
    onFrame?.(dt, clock.elapsedTime);
    aplicarPose();
    renderer.render(scene, camera);
  }

  resize();
  aplicarPose();

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
    pose,
    warnings,
    setPointer(nx, ny = 0) {
      if (nx === null) {
        puntero.activo = false;
        return;
      }
      puntero.activo = true;
      puntero.objetivoX = nx;
      puntero.objetivoY = ny;
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
    renderOnce() {
      resize();
      aplicarPose();
      renderer.render(scene, camera);
    },
    dispose() {
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.traverse(nodo => {
        const malla = nodo as Mesh;
        if (!malla.isMesh) return;
        malla.geometry?.dispose();
        const materiales = Array.isArray(malla.material) ? malla.material : [malla.material];
        for (const material of materiales) material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/** Degradado radial para la sombra, generado en un canvas: sin archivo. */
function crearTexturaSombra(): CanvasTexture {
  const lado = 128;
  const lienzo = document.createElement("canvas");
  lienzo.width = lado;
  lienzo.height = lado;
  const ctx = lienzo.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2);
    grad.addColorStop(0, "rgba(5, 8, 12, 0.85)");
    grad.addColorStop(0.55, "rgba(5, 8, 12, 0.35)");
    grad.addColorStop(1, "rgba(5, 8, 12, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, lado, lado);
  }
  return new CanvasTexture(lienzo);
}
