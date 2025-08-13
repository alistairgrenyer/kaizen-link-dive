module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  // Make sure Next.js recognizes this config
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
