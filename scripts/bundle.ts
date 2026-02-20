#!/usr/bin/env node
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import autoprefixer from 'autoprefixer';
import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import pxtorem from 'postcss-pxtorem';
import { build } from 'tsdown';
import { DIST_PATH, DOCS_PATH, ROOT_PATH } from './constants';

const { dest, src, watch } = gulp;

const baseOptions = {
  cwd: ROOT_PATH,
  entry: ['./src/index.ts'],
  dts: true,
  plugins: [],
  ignoreWatch: ['./src/__tests__', './src/style'],
  external: ['quill'],
  loader: {
    '.svg': 'text',
  } as const,
  sourcemap: true,
  minify: false,
  clean: false,
  watch: false,
};

export function buildStyle({
  isDev = false,
  onSuccess = () => {},
} = {}) {
  function buildLess() {
    return src(['./src/style/index.less'])
      .pipe(less())
      .pipe(
        postcss([
          autoprefixer(),
          pxtorem({
            rootValue: 16,
            propList: ['*'],
            selectorBlackList: ['.ql-'],
          }),
        ]),
      )
      .pipe(
        cleanCSS({}, (details) => {
          console.log(
            `${details.name}: ${details.stats.originalSize / 1000} KB -> ${
              details.stats.minifiedSize / 1000
            } KB`,
          );
        }),
      )
      .pipe(dest(resolve(DIST_PATH, 'style')))
      .pipe(dest(resolve(DOCS_PATH, 'style')))
      .on('finish', () => {
        onSuccess();
      });
  }
  if (isDev) {
    watch('./src/**/*.less', buildLess);
  }
  return buildLess();
}

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
        target: ['es2015'],
        inputOptions: {
          plugins: [
            ...options.plugins || [],
          ],
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
