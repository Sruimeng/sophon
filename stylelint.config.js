/** @type {import('stylelint').Config} */

export default {
  extends: ['stylelint-prettier/recommended', 'stylelint-config-standard'],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'at-rule-no-deprecated': [true, { ignoreAtRules: ['apply'] }],
    'color-hex-length': 'long',
  },
};
