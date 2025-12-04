import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import logger from './server/facades/logger.facade.ts'

// const viteLogger = createLogger()

// const childLogger = logger.child({ label: 'vite' })

// viteLogger.info = (msg, opts) => childLogger.debug(msg, opts)
// viteLogger.warn = (msg, opts) => childLogger.debug(msg, opts)
// viteLogger.error = (msg, opts) => childLogger.debug(msg, opts)


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
    // customLogger: viteLogger,
    plugins: [
        vue(), 
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
                '**/shared/**/server',
            ]
        }
    }
})
