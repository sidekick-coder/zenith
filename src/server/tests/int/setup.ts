import path from 'path'
import { ConfigService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import { createApp } from '#server/app.ts'
import seeder from '#server/facades/seeder.facade.ts'

if (!process.env.ZENITH_BASE_PATH) {
    process.env.ZENITH_BASE_PATH = path.resolve(import.meta.dirname, '..', '..', '..')
}

const logger = new LoggerService()

logger.info = (...args) => console.info('[setup]', ...args)
logger.error = (...args) => console.error('[setup]', ...args)
logger.warn = (...args) => console.warn('[setup]', ...args)

const config = new ConfigService()

config.set('database', {
    default: 'test',
    connections: { test: { dialect: 'memory', } }
})

config.set('database.migrator.auto', true)
config.set('users.auto', true)
config.set('users.registry', [
    {
        username: 'admin',
        password: 'admin-123',
        email: 'admin@test.com',
        name: 'Admin User',
        permissions: 'admin'
    }
])

const app = await createApp({
    logger,
    config
})

app.lifecycle.setOnError(async (error) => {
    console.error(error)

    process.exit(1)
})

await app.lifecycle.emit(['register', 'load'], { exclude: ['vite'] })
await app.lifecycle.emit(['boot'], { exclude: ['vite', 'http'] })

await seeder.run({ source: 'root' })
