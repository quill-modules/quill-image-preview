#!/usr/bin/env node
import type { BuildOptions, InputOptions, OutputOptions, RolldownPluginOption } from 'rolldown';
import minimist from 'minimist';
import { build, watch } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';
import { DIST_PATH, DOCS_PATH } from './constants';
import { removeDefaultIndexCSS } from './plugins';
import { run } from './run';
import { startServer } from './server';

const defaultOptions: BuildOptions & { plugins: RolldownPluginOption[] } = {
  input: 'src/index.ts',
  external: ['quill'],
  treeshake: true,
  plugins: [],
};
const formats = ['esm', 'umd'] as const;
const outputOptions: Record<typeof formats[number], (options: { dir: string }) => OutputOptions> = {
  esm: ({ dir }) => ({
    dir,
    format: 'esm',
    sourcemap: true,
  }),
  umd: ({ dir }) => ({
    dir,
    entryFileNames: 'index.umd.js',
    format: 'umd',
    name: 'QuillModule',
    globals: {
      quill: 'Quill',
    },
    exports: 'named',
    sourcemap: true,
    plugins: [removeDefaultIndexCSS()],
  }),
};
const inputOptions: Record<typeof formats[number], (options: { dir: string }) => InputOptions> = {
  esm: ({ dir }) => ({
    ...defaultOptions,
    plugins: [dts()],
    output: outputOptions.esm({ dir }),
  }),
  umd: ({ dir }) => ({
    ...defaultOptions,
    output: outputOptions.umd({ dir }),
  }),
};
function getBundleOptions(): BuildOptions[] {
  return formats.flatMap((format): BuildOptions | BuildOptions[] => {
    if (format === 'umd') {
      return [DIST_PATH, DOCS_PATH].map(dir => inputOptions[format]({ dir }));
    }
    return inputOptions[format]({ dir: DIST_PATH });
  });
}
function bundleScript() {
  return build(getBundleOptions());
}
function watchScript() {
  const watcher = watch(getBundleOptions().map(options => ({
    ...options,
    watch: {
      include: ['src/**/*.ts'],
      exclude: [],
    },
  })));
  watcher.on('event', (e) => {
    if (e.code === 'ERROR') {
      console.log(`[${(new Date()).toLocaleTimeString()}]: ${e.error}`);
    }
    if (e.code === 'END') {
      console.log(`[${(new Date()).toLocaleTimeString()}]: Build End!`);
    }
  });
}
async function main() {
  const { dev = false } = minimist(process.argv.slice(2));

  if (dev) {
    watchScript();
    startServer();
  }
  else {
    bundleScript();
  }
  run(`unocss \"src/**/*\"${dev ? ' -w' : ''}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
