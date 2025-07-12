import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    root: '.',
    publicDir: 'client/public',
    build: {
        rollupOptions: {
            input: 'client/index.html',
        },
    },
    resolve: {
        alias: {
            '@modules': '/modules',
        },
    },
})
