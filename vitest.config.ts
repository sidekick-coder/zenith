// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config'


export default defineConfig({ 
    test: { 
        watch: false,
        exclude: [
            '**/node_modules/**', 
            '**/dist/**', 
            '**/build/**',
            '**/coverage/**', 
            '**/logs/**',
            '**/root/**'
        ],
    },
})