import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    root: '.',
    publicDir: 'app/public',
    build: {
        rollupOptions: {
            input: 'app/index.html',
        },
    },
    resolve: {
        alias: {
            '@app': '/app',
            '@modules': '/modules',
        },
    },
})
