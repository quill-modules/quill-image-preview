import type { OutputOptions } from 'rolldown';

export function removeDefaultIndexCSS(): OutputOptions['plugins'] {
  return {
    name: 'remove-default-index.css',
    generateBundle(options, bundle) {
      delete bundle['index.css'];
      delete bundle['index.css.map'];
    },
  };
}
