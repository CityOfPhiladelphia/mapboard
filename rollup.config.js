import nodeResolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import analyzer from 'rollup-analyzer-plugin';

// get module names of dependencies (we want to treat these as externals so
// they don't get bundled)
import fs from 'fs';
import path from 'path';
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
const external = Object.keys(pkg.dependencies || {});

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'Mapboard',
  },
  external,
  plugins: [
    // allow implicit imports from index.js files
    nodeResolve(),
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
    vue(),
    // handle some es6-ish syntax that rollup doesn't like
    buble({
      transforms: {
        dangerousForOf: true,
      },
    }),
    uglify(),
    // analyzer(),
  ],
};
