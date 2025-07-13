import vue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import importPlugin from 'eslint-plugin-import';

export default defineConfigWithVueTs(
    vue.configs['flat/essential'],
    vue.configs['flat/recommended'],
    vue.configs['flat/strongly-recommended'],
    vueTsConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        ignores: ['node_modules', 'app/dist', 'app/components/ui', 'templates']
    },
    {
        rules: {

            'indent': ['error', 4],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            'vue/html-indent': ['error', 4],
            'vue/multi-word-component-names': 'off',
            "vue/max-attributes-per-line": ["error", {
                "singleline": {
                    "max": 1
                },
                "multiline": {
                    "max": 1
                }
            }]
        },
    },
    // prettier,
);
