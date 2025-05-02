import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(dirname(import.meta.url));
export const ROOT_PATH = resolve(__dirname, '..');
export const DOCS_PATH = resolve(ROOT_PATH, 'docs');
export const PKG_PATH = resolve(ROOT_PATH, 'src');
export const DIST_PATH = resolve(ROOT_PATH, 'dist');
