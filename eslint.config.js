import vue from 'eslint-plugin-vue'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import importPlugin from 'eslint-plugin-import'

export default defineConfigWithVueTs(
    { files: ['**/*.{js,ts,d.ts,vue}'], },
    { ignores: ['node_modules', 'client/dist', 'client/components/ui', 'console/templates', 'client/.runtime', 'server/.runtime'] },
    js.configs.recommended,
    ts.configs.recommended,
    vue.configs['flat/essential'],
    vue.configs['flat/recommended'],
    vue.configs['flat/strongly-recommended'],
    vueTsConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        rules: {
            'indent': ['error', 4],
            'semi': ['error', 'never'],
            'quotes': ['error', 'single'],
            'import/extensions': ['error', 'always'],
            'import/no-unresolved': 'off',
            'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
            'import/order': 'error',
            'import/newline-after-import': 'error',
            'object-curly-newline': ['error', { consistent: true, }],
            'object-property-newline': ['error'],
            'object-curly-spacing': ['error', 'always'],
            'array-element-newline': ['error', { 'ArrayExpression': 'consistent' }],
            'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
            'newline-per-chained-call': ['error', { 'ignoreChainWithDepth': 2 }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }],
            'vue/html-indent': ['error', 4],
            'vue/multi-word-component-names': 'off',
            'vue/max-attributes-per-line': ['error', {
                'singleline': { 'max': 1 },
                'multiline': { 'max': 1 }
            }],
            'vue/no-mutating-props': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    },
    {
        files: [
            '**/client/**/*.ts', 
            '**/client/**/*.vue',
            '**/modules/**/client/**/*.ts', 
            '**/modules/**/client/**/*.vue',
        ],
        rules: { 'import/extensions': 'off', }
    }
)
