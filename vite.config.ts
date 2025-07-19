import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    clearScreen: false,
    plugins: [vue(), tailwindcss()],
    root: '.',
    publicDir: 'app/public',
    resolve: {
        alias: {
            '@app': '/app',
            '@modules': '/modules',
        },
    },
})
