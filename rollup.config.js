import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import analyzer from 'rollup-analyzer-plugin';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

// get module names of dependencies (we want to treat these as externals so
// they don't get bundled)
import fs from 'fs';
import path from 'path';
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
const external = Object.keys(pkg.dependencies || {});

// don't bundle this css either
external.push('leaflet-measure/dist/leaflet-measure.css');

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/mapboard.js',
    format: 'umd',
    name: 'mapboard',
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
      md5: 'md5',
      proj4: 'proj4',
      'blueimp-md5-es6': 'md5',
    },
    sourcemap: true,
  },
  external,
  // don't bundle vendor deps
  plugins: [
    // allow implicit imports from index.js files
    resolve({
      // silence warning about preferring built-in modules over local ones
      preferBuiltins: true,
      // use browser versions of dependecy packages where available
      // browser: true,
      jsnext: true,
    }),
    // for bundling node built-in modules (we use `url`)
    builtins(),
    // the builtins have some references to `global` so handle those
    globals(),
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
    // handle commonjs modules, e.g. leaflet
    // REVIEW is this needed?
    commonjs(),
    // uglify(),
    // analyzer(),
  ],
};
