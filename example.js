"use strict";

const glsl = require("glslify");
const REGL = require("regl");
const createCube = require("primitive-cube");
const unindex = require("unindex-mesh");
const glMatrix = require("gl-matrix");

const renderEnvMap = require("./index");

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

const regl = REGL();

const cube = unindex(createCube(1));

const envmapCommand = regl({
  vert: glsl`
    precision highp float;

    attribute vec3 position;

    uniform mat4 view, projection;

    varying vec3 pos;

    void main() {
      gl_Position = projection * view * vec4(position, 1);
      pos = position;
    }
  `,
  frag: glsl`
    precision highp float;

    varying vec3 pos;

    #pragma glslify: atmosphere = require(glsl-atmosphere)

    void main() {
      vec3 color = atmosphere(
        normalize(pos),
        vec3(0,6372e3,0),
        vec3(0, 0.25, -1),
        22.0,
        6371e3,
        6471e3,
        vec3(5.5e-6, 13.0e-6, 22.4e-6),
        21e-6,
        8e3,
        1.2e3,
        0.758
      );

      gl_FragColor = vec4(color, 1);
    }
  `,
  attributes: {
    position: cube,
  },
  uniforms: {
    view: regl.prop("view"),
    projection: regl.prop("projection"),
  },
  viewport: regl.prop("viewport"),
  framebuffer: regl.prop("framebuffer"),
  count: cube.length / 3,
});

function renderer(config) {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1,
    framebuffer: config.framebuffer,
  });
  envmapCommand({
    view: config.view,
    projection: config.projection,
    viewport: config.viewport,
    framebuffer: config.framebuffer,
  });
}

const envMap = renderEnvMap(regl, renderer);

const skyboxCommand = regl({
  vert: glsl`
    precision highp float;
    attribute vec3 position;
    uniform mat4 view, projection;
    varying vec3 pos;
    void main() {
      gl_Position = projection * view * vec4(position, 1);
      pos = position;
    }
  `,
  frag: glsl`
    precision highp float;
    uniform samplerCube envMap;
    varying vec3 pos;
    void main() {
      gl_FragColor = textureCube(envMap, normalize(pos));
    }
  `,
  attributes: {
    position: cube,
  },
  uniforms: {
    view: regl.prop("view"),
    projection: regl.prop("projection"),
    envMap: regl.prop("envMap"),
  },
  viewport: regl.prop("viewport"),
  count: cube.length / 3,
});

function loop() {
  const t = performance.now() * 0.001;

  const view = mat4.lookAt(
    [],
    [0, 0, 0],
    [Math.cos(t), 0, Math.sin(t)],
    [0, 1, 0]
  );
  const projection = mat4.perspective(
    [],
    Math.PI / 3,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  skyboxCommand({
    view: view,
    projection: projection,
    envMap: envMap,
    viewport: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  requestAnimationFrame(loop);
}

loop();
