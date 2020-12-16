import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import cleaner from 'rollup-plugin-cleaner'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: './dist/es/',
      format: 'es',
    },
    {
      dir: './dist/cjs/',
      format: 'cjs',
    },
  ],
  external: [],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      extensions: ['.ts', '.js'],
    }),
    json(),
    cleaner({ targets: ['dist'] }),
    resolve({
      extensions: ['.ts', '.mjs', '.js', '.json', '.node'],
    }),
    commonjs(),
  ],
}
