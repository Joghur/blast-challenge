module.exports = {
  root: true,
  env: {
    es6: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks', 'react', 'import', 'promise', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {},
    },
  ],
};
