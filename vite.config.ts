import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


let allowedHosts = [
    'localhost',
]

if (process.env.VITEST_ALLOWED_HOSTS) {
    allowedHosts = allowedHosts.concat(
        process.env.VITEST_ALLOWED_HOSTS.split(',').map(h => h.trim())
    )
}


export default defineConfig({
    clearScreen: false,
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('iconify-icon'),
                }
            }
        }), 
        tailwindcss()
    ],
    publicDir: 'client/public',
    server: {
        allowedHosts,
        watch: {
            ignored: [
                '**/shared',
                '**/server',
                '**/storage',
                '**/modules/**/server',
                '**/.env', // Ignores .env files in the root and subdirectories
                '**/.env.*', // Ignores all .env-related files (e.g., .env.local, .env.development)
                '**/vite.config.*', // Ignores Vite config files
                '**/*.{test,spec}.{ts,js}', // Ignores test files
            ]
        },
    }
})
