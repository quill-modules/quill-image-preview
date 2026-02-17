import { factory } from '@zzxming/eslint-config';

export default factory({
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
