import prettier from 'eslint-config-prettier';

const sharedRules = {
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  'no-console': 'off',
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  'no-trailing-spaces': 'error',
  'semi': ['error', 'always'],
  'quotes': ['error', 'single', { avoidEscape: true }],
};

export default [
  {
    ignores: ['node_modules/', 'uploads/', 'dist/', 'coverage/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: sharedRules,
  },
  {
    files: ['public/js/**/*.js', 'tests/**/*.js', 'vitest.config.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        Event: 'readonly',
        FileReader: 'readonly',
        File: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: sharedRules,
  },
  prettier,
];
