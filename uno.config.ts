import { resolve } from 'node:path';
import {
  defineConfig,
  presetIcons,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import { DIST_PATH, DOCS_PATH } from './scripts/constants';

export default defineConfig({
  cli: {
    entry: [
      {
        patterns: ['src/**/*.ts'],
        outFile: resolve(DIST_PATH, 'style', 'index.css'),
      },
      {
        patterns: ['src/**/*.ts'],
        outFile: resolve(DOCS_PATH, 'style', 'index.css'),
      },
    ],
  },
  presets: [
    presetWind4({ preflights: { reset: false } }),
    presetIcons({
      autoInstall: false,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
});
