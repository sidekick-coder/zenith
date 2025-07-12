import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), tailwindcss()],
    root: '.',
    publicDir: 'app/public',
    build: {
        rollupOptions: {
            input: 'index.html',
        },
    },
    resolve: {
        alias: {
            '@app': '/app',
            '@modules': '/modules',
        },
    },
})
