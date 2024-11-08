import pluginVue from 'eslint-plugin-vue'
import pluginJest from 'eslint-plugin-jest'
import skipPrettierFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
    {
        name: 'certifaction/verification/files-to-lint',
        files: ['**/*.{js,mjs,vue}'],
    },

    ...pluginVue.configs['flat/vue2-essential'],

    {
        name: 'certifaction/verification/jest-test',
        files: ['**/tests/**', '**/*.test.js'],
        plugins: { jest: pluginJest },
    },

    skipPrettierFormatting,
]
