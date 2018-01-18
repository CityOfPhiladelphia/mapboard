import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import analyzer from 'rollup-analyzer-plugin';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';

// get module names of dependencies (we want to treat these as externals so
// they don't get bundled)
import fs from 'fs';
import path from 'path';
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
const external = Object.keys(pkg.dependencies || {});

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/build.js',
    format: 'umd',
    name: 'Mapboard',
    // silence warning about multiple exports
    exports: 'named',
    // tell rollup the global names for vendor modules
    globals: {
      leaflet: 'L',
      jquery: '$',
      axios: 'axios',
      vue: 'Vue',
      vuex: 'Vuex',
      vuex: 'Vuex',
      turf: 'turf',
    },
  },
  external,
  // don't bundle vendor deps
  plugins: [
    // allow implicit imports from index.js files
    resolve({
      // silence warning about preferring built-in modules over local ones
      preferBuiltins: true,
    }),
    // for bundling node built-in modules (we use `url`)
    builtins(),
    // the builtins have some references to `global` so handle those
    globals(),
    // handle commonjs modules, e.g. leaflet
    commonjs({
      // specify each named import from leaflet
      namedExports: {
        'node_modules/leaflet/dist/leaflet-src.js': [
          'Map',
          'LatLng',
          'geoJSON',
          'CircleMarker',
          'Circle',
        ],
      }
    }),
    // transform .vue components
    vue({
      css: true,
    }),
    // downgrade es6
    buble({
      transforms: {
        dangerousForOf: true,
      },
    }),
    uglify(),
    // analyzer(),
  ],
};
