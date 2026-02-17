#!/usr/bin/env node
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'tsdown';
import { DIST_PATH, DOCS_PATH, ROOT_PATH } from './constants';

const baseOptions = {
  cwd: ROOT_PATH,
  entry: ['./src/index.ts'],
  outDir: DIST_PATH,
  dts: true,
  plugins: [],
  ignoreWatch: ['./src/style', './src/__tests__'],
  external: ['quill'],
  noExternal: [],
  loader: {
    '.svg': 'text',
  } as const,
  sourcemap: true,
  minify: false,
  clean: false,
  watch: false,
};

export async function buildTS({
  isDev = false,
  onSuccess = () => {},
} = {}) {
  const options = {
    ...baseOptions,
    minify: !isDev,
    watch: isDev ? ['./src'] : false,
  };
  return Promise.all([
    isDev
      ? null
      : build({
          ...options,
          format: ['esm'],
          outExtensions: () => ({ js: '.js' }),
        }),
    build(
      {
        ...options,
        format: ['umd'],
        platform: 'browser',
        inputOptions: {
          plugins: [...options.plugins || []],
        },
        outputOptions: {
          name: 'QuillImagePreview',
          format: 'umd',
          globals: {
            quill: 'Quill',
          },
          exports: 'named',
          plugins: [],
        },
        onSuccess() {
          copyFileSync(resolve(DIST_PATH, 'index.umd.js'), resolve(DOCS_PATH, 'index.umd.js'));
          copyFileSync(resolve(DIST_PATH, 'index.umd.js.map'), resolve(DOCS_PATH, 'index.umd.js.map'));
          console.log(`Copied index.umd.js to demo bundle`);
          onSuccess();
        },
      },
    ),
  ]);
}
