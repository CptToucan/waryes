// Import rollup plugins
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

export default {
  plugins: [
    // Entry point for application build; can specify a glob to build multiple

    // HTML files for non-SPA app
    commonjs(),
    typescript(),
    html({
      input: 'src/index.html',
    }),

    // Resolve bare module specifiers to relative paths

    resolve(),

    // Minify HTML template literals

    minifyHTML(),

    // Minify JS

    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),

    // Optional: copy any static assets to build directory

    copy({
      targets: [{src: ['styles/fonts/*'], dest: 'build/assets/fonts'}],
    }),

    serve('build'),
  ],

  input: {
    file: "src/init.ts"
  },

  output: {
    dir: 'build',
  },

  preserveEntrySignatures: 'strict',
};
