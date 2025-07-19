import vue from 'eslint-plugin-vue'
import js from '@eslint/js'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import importPlugin from 'eslint-plugin-import'

export default defineConfigWithVueTs(
    {
        files: ['**/*.{js,ts,d.ts,vue}'],
    },
    {
        ignores: ['node_modules', 'app/dist', 'app/components/ui', 'templates']
    },
    js.configs.recommended,
    vue.configs['flat/essential'],
    vue.configs['flat/recommended'],
    vue.configs['flat/strongly-recommended'],
    vueTsConfigs.recommended,
    // importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        rules: {
            'indent': ['error', 4],
            'semi': ['error', 'never'],
            'quotes': ['error', 'single'],
            'import/extensions': ['error', 'always'],
            'import/no-unresolved': 'off',
            'object-curly-newline': ['error', {
                'ObjectExpression': 'always',
                'ObjectPattern': {
                    'multiline': true 
                },
                'ImportDeclaration': {
                    'multiline': true,
                    'minProperties': 3
                },
                'ExportDeclaration': {
                    'multiline': true,
                    'minProperties': 3 
                }
            }],
            'object-property-newline': ['error', {
                'allowAllPropertiesOnSameLine': false 
            }],
            'array-element-newline': ['error', {
                'ArrayExpression': 'consistent' 
            }],
            'brace-style': ['error', '1tbs', {
                'allowSingleLine': true 
            }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_'
            }],
            'vue/html-indent': ['error', 4],
            'vue/multi-word-component-names': 'off',
            'vue/max-attributes-per-line': ['error', {
                'singleline': {
                    'max': 1
                },
                'multiline': {
                    'max': 1
                }
            }]
        },
    },
    {
        files: ['**/app/**/*.ts', '**/app/**/*.vue'],
        rules: {
            'import/extensions': 'off',
        }
    }
)
