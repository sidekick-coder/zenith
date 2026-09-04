import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import db from '#server/facades/db.facade.ts'

export default defineHandler(async ({ body }) => {
    const payload = body
    const driver = payload.type
    const options = payload.options || {}

    const connection = db.createConnection(driver, options)

    const [error] = await $try(() => db.createDatabase(connection))

    if (error) {
        throw new BaseException(error.message || $t('Database connection test failed'), 400)
    }

    return { 
        status: 200, 
        success: true, 
        message: $t('Database connection test successful')
    }
})
