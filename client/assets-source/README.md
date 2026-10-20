# Origen y optimización del robot del hero

`public/assets/models/aether-02.glb` es la versión **servida** (optimizada). Aquí
queda el rastro para poder repetir el proceso.

## Original

- Modelo: **AETHER-02**, de <https://github.com/RamonLinares/atlas-09> (CC0).
- Licencia: la copia íntegra vive junto al modelo servido, en
  `public/assets/models/LICENSE.txt`.
- Archivo: `aether-02.source.glb` (5,7 MB). **No se versiona**
  (ver `.gitignore`): si no está, volver a bajarlo del enlace de arriba.

## Qué se le hizo

`optimize-aether.mjs` reproduce la optimización con el SDK de
[glTF-Transform](https://gltf-transform.dev). No hay dependencia nueva en
`package.json`: se ejecuta una sola vez, desde un directorio temporal.

Desde `client`, en un directorio temporal (ESM resuelve los paquetes desde la
carpeta del script, así que hay que copiarlo junto a sus dependencias):

```sh
CLIENT=$PWD
mkdir -p /tmp/glbopt && cd /tmp/glbopt && npm init -y
npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 sharp meshoptimizer
cp "$CLIENT/assets-source/optimize-aether.mjs" .
node optimize-aether.mjs "$CLIENT/assets-source/aether-02.source.glb" "$CLIENT/public/assets/models/aether-02.glb"
```

Imprime los huesos del skin y los atributos de cada primitiva para comprobar
que el rig sobrevive.

Pasos, y por qué:

1. **Se borran los 11 clips de animación** (~233 KB). El hero no monta
   `AnimationMixer`: la pose es 100 % procedural (`aetherPose.ts`,
   `aetherTimeline.ts`), y los clips mueven `root`, así que pelearían con ella.
2. **`prune({ keepAttributes: false })`** quita el segundo juego de UV y los
   atributos que ningún material usa.
3. **Se elimina `TANGENT`.** three.js reconstruye la base TBN por derivadas
   cuando hay normal map sin tangentes. Ahorra ~150 KB y la diferencia medida
   en el primer plano es de 124 píxeles sobre 102.400 (0,12 %), en el filo del
   brillo especular del casco.
4. **Texturas a WebP**, con calidad por ranura porque la cámara sólo encuadra
   la cabeza: color base **2048, q80** y normal **1024, q85** se quedan como
   estaban de resolución; el ORM baja a q75 y la emisión —una máscara de brillo
   difuso— a 1024/q80.
5. **Meshopt** (`EXT_meshopt_compression`) en lugar de Draco: el decodificador
   son ~20 KB de WASM frente a los ~200 KB de Draco, y llega con three, no en
   el bundle inicial. Se registra en `aetherScene.ts` con `setMeshoptDecoder`.

**No se simplifica la malla:** siguen siendo 24.310 triángulos y el skin
`AETHER_02_RIG` conserva sus 18 huesos con `JOINTS_0`/`WEIGHTS_0` en las cinco
primitivas.

Resultado: **5,7 MB → 1,4 MB** en disco; 3,8 MB → 1,3 MB transferidos con gzip,
y de 186 ms a 76 ms de descarga en local.
