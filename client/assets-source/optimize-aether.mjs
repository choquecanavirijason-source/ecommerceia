/**
 * Optimiza el GLB del robot del hero. Ver README.md de esta carpeta para el
 * porqué de cada paso y el comando completo.
 *
 *   node optimize-aether.mjs <origen.glb> <destino.glb>
 */

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, weld, reorder, quantize, textureCompress } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const [src, dst] = process.argv.slice(2);
if (!src || !dst) {
  console.error("uso: node optimize-aether.mjs <origen.glb> <destino.glb>");
  process.exit(1);
}

await MeshoptEncoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const doc = await io.read(src);
const root = doc.getRoot();

// 1. El hero no monta AnimationMixer: la pose es 100 % procedural y los clips
//    mueven `root`, así que pelearían con ella.
const animations = root.listAnimations();
for (const animation of animations) animation.dispose();
console.log(`animaciones eliminadas: ${animations.length}`);

await doc.transform(
  dedup(),
  // keepAttributes:false descarta el segundo juego de UV y todo atributo que
  // ningún material use.
  prune({ keepAttributes: false, keepLeaves: false, keepSolidTextures: false }),
  weld(),
);

// 2. three.js reconstruye la base TBN por derivadas cuando hay normal map sin
//    tangentes; ahorra ~150 KB sin diferencia visible en el primer plano.
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const tangent = prim.getAttribute("TANGENT");
    if (!tangent) continue;
    prim.setAttribute("TANGENT", null);
    tangent.dispose();
  }
}

// 3. Calidad por ranura: la cámara sólo encuadra la cabeza, así que el color
//    base y el normal conservan resolución y la mayor calidad; el ORM y la
//    máscara de emisión toleran mucha más pérdida sin verse.
const WEBP = { encoder: sharp, targetFormat: "webp", effort: 100 };
await doc.transform(
  textureCompress({ ...WEBP, slots: /baseColorTexture/, quality: 80 }),
  textureCompress({ ...WEBP, slots: /normalTexture/, quality: 85 }),
  textureCompress({ ...WEBP, slots: /metallicRoughnessTexture/, quality: 75 }),
  textureCompress({ ...WEBP, slots: /emissiveTexture/, quality: 80, resize: [1024, 1024] }),
);

// 4. Meshopt: reorder + cuantización + EXT_meshopt_compression. El
//    decodificador es mucho más barato que el de Draco.
await doc.transform(
  reorder({ encoder: MeshoptEncoder, target: "size" }),
  quantize({
    pattern: /^(POSITION|NORMAL|TANGENT|TEXCOORD|COLOR|WEIGHTS)(_\d+)?$/,
    quantizePosition: 14,
    quantizeNormal: 10,
    quantizeTexcoord: 12,
    quantizeWeight: 8,
  }),
);
doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

// 5. Comprobación: el rig y el skinning tienen que sobrevivir intactos.
for (const skin of root.listSkins()) {
  console.log(`skin ${skin.getName()}: ${skin.listJoints().length} huesos`);
}
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    console.log(`  primitive: ${prim.listSemantics().sort().join(", ")}`);
  }
}

await io.write(dst, doc);
console.log("escrito", dst);
