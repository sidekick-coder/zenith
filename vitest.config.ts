 
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
                    include: ['server/tests/int/**/*.test.ts'],
                    setupFiles: ['server/tests/int/setup.ts'],
                    testTimeout: 60000, // Increase timeout for integration tests
                    hookTimeout: 60000, // Increase hook timeout for integration tests
                }
            }
        ]
    },
})
