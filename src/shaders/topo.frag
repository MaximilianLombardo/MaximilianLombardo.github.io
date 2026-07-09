uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uLines;
uniform float uMajorEvery;
uniform vec3 uLineColor;
uniform vec3 uMajorColor;
uniform vec3 uBgLow;
uniform vec3 uBgHigh;
varying vec2 vUv;

#include ./_lib/common.glsl;

void main() {
  vec2 uv = vUv;
  uv.x *= uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  float h = fbm(uv * uScale + vec2(t * 0.15, t * 0.08));
  h += 0.25 * fbm(uv * uScale * 2.3 - t * 0.1);
  h /= 1.25;

  float levels = h * uLines;
  float f = fract(levels);
  float w = fwidth(levels);
  float line = 1.0 - smoothstep(0.0, w * 1.6, min(f, 1.0 - f));

  float idx = floor(levels + 0.5);
  float isMajor = 1.0 - min(mod(idx, uMajorEvery), 1.0);

  vec3 bg = mix(uBgLow, uBgHigh, h);
  vec3 lineCol = mix(uLineColor, uMajorColor, isMajor);
  float strength = line * mix(0.45, 1.0, isMajor);
  vec3 col = bg + lineCol * strength;

  gl_FragColor = vec4(col, 1.0);
}
