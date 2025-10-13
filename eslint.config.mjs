import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    languageOptions: { globals: globals.node },
  },
  {
    ignores: [
      'node_modules/*',
      'node_modules',
      'node_modules/**/*',
      'dist/*',
      'dist/**/*',
      'dist',
      '.database',
      '.database/*',
      'public/*',
      'public/**/*',
      'src/openapi*',
      'src/admin/*',
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
