import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import {defineConfig} from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {ignores: ['dist', 'node_modules']},

  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  prettier,

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': ['error', {allow: ['warn', 'error']}],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {caughtErrors: 'none'}],
    },
  },

  {
    files: ['src/components/**/*.{ts,tsx}'],
    ignores: ['src/components/**/*Controller.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/resources/**', '@/services/**', '@/storage/**', '@/store/**'],
              message: 'Presentational components receive data through props.',
            },
          ],
        },
      ],
    },
  },
);
