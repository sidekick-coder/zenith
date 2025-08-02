import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import logger from './server/facades/logger.facade.ts'

const viteLogger = createLogger()

const childLogger = logger.child({ label: 'vite' })

viteLogger.info = (msg, opts) => childLogger.debug(msg, opts)
viteLogger.warn = (msg, opts) => childLogger.debug(msg, opts)
viteLogger.error = (msg, opts) => childLogger.debug(msg, opts)

export default defineConfig({
    clearScreen: false,
    customLogger: viteLogger,
    plugins: [vue(), tailwindcss()],
    root: '.',
    publicDir: 'client/public',
    resolve: {
        alias: {
            '#client': '/client',
            '#modules': '/modules',
            '#router': '/router',
            '#server/facades': '/facades',
            '#server/services': '/services',
        },
    },
    build: { rollupOptions: { input: { app: 'client/index.html', }, }, },
    server: {
        watch: {
            ignored: [
                '**/server',
                '**/console',
                '**/modules/**/server',
            ]
        }
    }
})
