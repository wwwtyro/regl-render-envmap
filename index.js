"use strict";

const mat4 = require("gl-matrix").mat4;
const vec3 = require("gl-matrix").vec3;

module.exports = function renderCubemap(regl, renderer, opts) {
  opts = opts || {};
  opts.resolution = opts.resolution === undefined ? 1024 : opts.resolution;
  opts.near = opts.near === undefined ? 0.1 : opts.near;
  opts.far = opts.far === undefined ? 1000 : opts.far;
  opts.eye = opts.eye === undefined ? [0, 0, 0] : opts.eye;

  opts.cubeFBO =
    opts.cubeFBO === undefined
      ? regl.framebufferCube(opts.resolution)
      : opts.cubeFBO;

  const faces = [
    { center: [1, 0, 0], up: [0, -1, 0], fbo: opts.cubeFBO.faces[0] },
    { center: [-1, 0, 0], up: [0, -1, 0], fbo: opts.cubeFBO.faces[1] },
    { center: [0, 1, 0], up: [0, 0, 1], fbo: opts.cubeFBO.faces[2] },
    { center: [0, -1, 0], up: [0, 0, -1], fbo: opts.cubeFBO.faces[3] },
    { center: [0, 0, 1], up: [0, -1, 0], fbo: opts.cubeFBO.faces[4] },
    { center: [0, 0, -1], up: [0, -1, 0], fbo: opts.cubeFBO.faces[5] },
  ];

  for (let f of faces) {
    const view = mat4.lookAt([], opts.eye, vec3.add([], opts.eye, f.center), f.up);
    const projection = mat4.perspective(
      [],
      Math.PI / 2,
      1,
      opts.near,
      opts.far
    );
    const viewport = {
      x: 0,
      y: 0,
      width: opts.cubeFBO.width,
      height: opts.cubeFBO.height,
    };
    renderer({
      view: view,
      projection: projection,
      viewport: viewport,
      framebuffer: f.fbo,
    });
  }

  return opts.cubeFBO;
};
