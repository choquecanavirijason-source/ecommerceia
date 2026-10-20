/**
 * Pase de postprocesado psicodélico: aberración cromática cian/magenta,
 * glitch por bandas y el charco de luz con ondulación del fondo.
 *
 * El fondo se resuelve aquí, en espacio de pantalla, y no con un plano en la
 * escena: un plano recortaba un rectángulo visible y la portada exige el
 * robot sin recuadro. El halo se desvanece radialmente y sólo pinta donde no
 * hay robot, así que nunca aparece un borde recto.
 *
 * El canal alfa se preserva porque el canvas va sobre el degradado de la
 * sección: si el pase devolviera alfa 1 se vería una caja negra.
 *
 * El charco va deliberadamente flojo. Con la intensidad anterior llegaba a un
 * alfa de ~8 % en reposo y ~22 % con la cabeza lanzada; medido ahora sobre las
 * zonas del canvas sin robot se queda en ~1 %. No era la causa de la
 * "división" que se veía contra el fondo —esa era el `drop-shadow` del canvas,
 * ya retirado—, pero sí le restaba contraste al robot. Subirlo lo vuelve a
 * velar.
 */

import type { Color, IUniform } from "three";

export interface PsychedelicUniforms {
  tDiffuse: IUniform<null>;
  uAberration: IUniform<number>;
  uGlitch: IUniform<number>;
  uTime: IUniform<number>;
  uGlow: IUniform<number>;
  uEnergy: IUniform<number>;
  uAspect: IUniform<number>;
  uCyan: IUniform<Color>;
  uMagenta: IUniform<Color>;
}

export const PsychedelicShader = {
  name: "PsychedelicShader",

  uniforms: {
    tDiffuse: { value: null },
    /** Separación de canales, en fracción de pantalla. */
    uAberration: { value: 0 },
    /** Intensidad del glitch por bandas, 0..1. */
    uGlitch: { value: 0 },
    uTime: { value: 0 },
    /** Halo aditivo sobre las zonas ya brillantes (visor). */
    uGlow: { value: 0.35 },
    /** Velocidad angular de la cabeza, 0..1: aviva la ondulación del fondo. */
    uEnergy: { value: 0 },
    uAspect: { value: 1 },
    uCyan: { value: null },
    uMagenta: { value: null },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAberration;
    uniform float uGlitch;
    uniform float uTime;
    uniform float uGlow;
    uniform float uEnergy;
    uniform float uAspect;
    uniform vec3 uCyan;
    uniform vec3 uMagenta;
    varying vec2 vUv;

    float hash( float n ) {
      return fract( sin( n ) * 43758.5453123 );
    }

    void main() {
      vec2 uv = vUv;

      // Glitch: desplaza bandas horizontales completas en momentos puntuales.
      if ( uGlitch > 0.001 ) {
        float band = floor( uv.y * 28.0 );
        float noise = hash( band + floor( uTime * 24.0 ) );
        float bandHit = step( 1.0 - uGlitch * 0.5, noise );
        uv.x += ( noise - 0.5 ) * 0.075 * uGlitch * bandHit;
      }

      // Aberración radial: el centro queda limpio, los bordes se abren.
      vec2 dir = uv - 0.5;
      float amount = uAberration * ( 0.35 + dot( dir, dir ) * 2.2 );

      // Cian en un extremo, magenta en el otro: el desplazamiento del canal
      // verde acompaña al rojo para que la franja leída sea magenta.
      vec4 cyan = texture2D( tDiffuse, uv - dir * amount );
      vec4 base = texture2D( tDiffuse, uv );
      vec4 magenta = texture2D( tDiffuse, uv + dir * amount );

      vec3 color = vec3( magenta.r, base.g, cyan.b );
      color.g = mix( color.g, cyan.g, 0.5 );

      // El alfa toma el máximo para que los flecos de color no queden
      // recortados contra el fondo transparente.
      float alpha = max( max( cyan.a, base.a ), magenta.a );

      // Halo barato sobre lo que ya brilla, en lugar de un bloom completo
      // (UnrealBloomPass ensucia el alfa sobre fondo transparente).
      float luma = dot( color, vec3( 0.299, 0.587, 0.114 ) );
      float bright = smoothstep( 0.55, 1.0, luma );
      color += color * bright * uGlow;

      // Charco de luz con ondulación suave, sólo donde no hay robot.
      vec2 radial = vec2( dir.x * uAspect, dir.y );
      float r = length( radial );
      float falloff = smoothstep( 0.48, 0.08, r );
      float ripple = mix( 0.5, 1.0, sin( r * 14.0 - uTime * 1.2 ) * 0.5 + 0.5 );
      float tint = smoothstep( -0.25, 0.25, dir.x );
      float pool = falloff * ripple * ( 0.028 + uEnergy * 0.05 ) * ( 1.0 - alpha );

      color += mix( uCyan, uMagenta, tint * 0.6 ) * pool;
      alpha = max( alpha, pool );

      gl_FragColor = vec4( color, alpha );
    }
  `,
};
