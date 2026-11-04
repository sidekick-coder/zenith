 
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
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['**/*.unit.test.ts'],
                }
            },
            {
                test: {
                    name: 'int',
                    include: ['tests/integration/**/*.spec.ts'],
                    // setupFiles: ['tests/int/setup.ts'],
                    testTimeout: 120_000, // Increase timeout for integration tests
                    hookTimeout: 120_000, // Increase hook timeout for integration tests
                }
            }
        ]
    },
})
