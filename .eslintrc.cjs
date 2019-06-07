module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "complexity": ["error", { max: 10 }],
    "@typescript-eslint/no-floating-promises": ["error"],
    "@typescript-eslint/prefer-for-of": ["error"],
    "@typescript-eslint/no-unnecessary-condition": ["error", { "allowConstantLoopConditions": true }],
  },
  "overrides": [
  ],
};
