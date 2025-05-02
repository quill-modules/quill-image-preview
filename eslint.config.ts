import { factory } from '@zzxming/eslint-config';

export default factory({
  unocss: true,
  overrides: [
    {
      ignores: [],
    },
    {
      rules: {
        'unicorn/no-array-for-each': 'off',
      },
    },
  ],
});
