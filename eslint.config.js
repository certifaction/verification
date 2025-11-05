import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipPrettierFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
    {
        name: 'certifaction/verification/files-to-lint',
        files: ['**/*.{js,mjs,jsx,vue}'],
    },

    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },

    js.configs.recommended,
    ...pluginVue.configs['flat/vue2-essential'],
    ...pluginOxlint.configs['flat/recommended'],

    {
        name: 'certifaction/verification/jest-test',
        files: ['**/tests/**', '**/*.test.js'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
        },
    },

    skipPrettierFormatting,
])
