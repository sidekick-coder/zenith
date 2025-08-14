import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
import db from '#server/facades/db.facade.ts'

// unhandled errors
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
})

await config.load()
await db.load(undefined, true)

await importAll(basePath('server/commands'))

program.parse()
