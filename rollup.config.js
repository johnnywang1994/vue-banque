import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve'; // allocate modules
import commonjs from '@rollup/plugin-commonjs'; // convert cjs to es6 module
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const commonConfig = {
  plugins: [
    nodeResolve(),
    typescript(),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    (isProd && terser()),
    commonjs()
  ],
  external: [
    'vue',
    /@babel\/runtime/
  ]
};

const umdConfig = defineConfig({
  ...commonConfig,
  input: 'src/umd.ts',
  output: {
    name: 'VueBanque',
    file: 'dist/vue-banque.min.js',
    format: 'umd',
    exports: 'default',
    sourcemap: isProd,
    compact: isProd,
    globals: {
      vue: 'Vue'
    },
  },
});

const cjsConfig = defineConfig({
  ...commonConfig,
  input: 'src/main.ts',
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: isProd,
  },
});

const esConfig = defineConfig({
  ...commonConfig,
  input: 'src/module.ts',
  output: {
    file: pkg.module,
    format: 'es',
    sourcemap: isProd,
  },
});

export default [umdConfig, cjsConfig, esConfig];
