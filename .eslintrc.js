module.exports = {
  extends: [
    '@eslint/js',
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'eslint-config-prettier',
    'plugin:react/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  env: { browser: true, node: true },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
};