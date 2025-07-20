import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import logger from './logger.ts'

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
    publicDir: 'app/public',
    resolve: {
        alias: {
            '#app': '/app',
            '#modules': '/modules',
            '#router': '/router',
            '#facades': '/facades',
            '#services': '/services',
        },
    },
})
