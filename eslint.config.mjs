// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // 1. Ignore build outputs and dependencies
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**'],
  },

  js.configs.recommended,

  // 2. NODE & CONFIG FILES (Root configs, server, and setup scripts)
  {
    files: [
      '*.config.{js,cjs,mjs}',
      '**/*.config.{js,cjs,mjs}',
      'server/**/*.js',
      '**/jest.setup.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Enables require, module, process, __dirname, etc.
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  // 3. TEST FILES (Client and Server test suites)
  {
    files: [
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      '**/tests/**/*.{js,jsx}',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser, // Enables window, fetch, etc.
        ...globals.node,    // Enables global, process in test environments
        ...globals.jest,    // Enables describe, test, expect, jest, beforeEach, etc.
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 4. CLIENT APPLICATION SOURCE CODE (React App components)
  {
    files: ['client/src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];