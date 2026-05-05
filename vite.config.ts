import path from 'node:path'
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
    root: import.meta.dirname,
    plugins: [
        vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('iconify-icon'), } } }),
        tailwindcss()
    ],
    optimizeDeps: {
        exclude: [
            '@sidekick-coder/zenith-kit',
            '@sidekick-coder/zenith-kit/server',
            '@sidekick-coder/zenith-kit/shared',
        ] 
    },
    publicDir: path.resolve(import.meta.dirname, 'client/public'),
    // resolve: {
    // dedupe: ['vue'],
    // alias: {
    //     'vue/server-renderer': path.resolve(import.meta.dirname, 'node_modules/vue/server-renderer/index.mjs'),
    //     vue: path.resolve(import.meta.dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
    // }
    // },
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
    },
    build: { minify: process.env.NO_MINIFY === 'true' ? false : undefined, }

})
