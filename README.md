# regl-render-envmap

A simple tool for rendering environment maps with [regl](https://github.com/regl-project/regl). Calls a render function,
that you provide, for each face of an environment cubemap, and returns a regl `framebufferCube` object that can be
immediately used as a `samplerCube` in your shaders.

## Install

```
npm install regl-render-envmap
```

## Example

```
const renderEnvMap = require("regl-render-envmap");

const cube = generateCubePositions();

const envmapCommand = regl({
  vert: glsl`
    attribute vec3 position;
    uniform mat4 view, projection;
    void main() {
      gl_Position = projection * view * vec4(position, 1);
    }
  `,
  frag: glsl`
    void main() {
      gl_FragColor = vec4(1,0,1,1);
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
  // Called 6 times by renderEnvMap to render each face
  // of the environment map.

  // regl reuses the depth buffer for all faces, so clear it each time.
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
```

## Usage

```
const renderEnvMap = require('regl-render-envmap');

const envMap = renderEnvMap(regl, renderCallback, opts);
```

`renderEnvMap` calls `renderCallback` 6 times, once for each face of the environment cubemap, and returns a regl `framebufferCube` object
that can be immediately used as a `samplerCube` in your shaders.

#### Parameters

**regl**: The regl context you want to use the resulting regl `framebufferCube` object in.

**renderCallback**: The callback you provide that renders each face. This function should take a single parameter, `config`,
which provides the following:

* **view**: the view matrix for this face of the environment cubemap
* **projection**: the projection matrix for this face of the environment cubemap
* **viewport**: the viewport
* **framebuffer**: the regl `framebuffer` object that should be rendered to

**opts**: An object with the following members:

* near: the near plane to use when constructing the projection matrix, float, default 0.1
* far: the far plane to use when constructing the projection matrix, float, default 1000.0
* eye: the position of the camera, vec3, default [0, 0, 0]
* resolution: the resolution of each square face of the environment cubemap, int, default 1024
* cubeFBO: the regl `framebufferCube` object that will be returned, default `regl.framebufferCube(resolution)`

#### Returns

`renderEnvMap` will return a regl `framebufferCube` object that can be immediately used as a `samplerCube` in your shaders.

## Notes

* regl shares the depth buffer amongst all faces of a `framebufferCube` object, so it's important to clear the depth buffer
  in your `renderCallback` function. This is also true of the stencil buffer, if that's relevant to you. This may not
  be applicable if you're providing `cubeFBO` in the `opts` parameter of `renderEnvMap` and altering the `depth` or
  `stencil` parameters.
