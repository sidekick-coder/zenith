import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'

// unhandled errors
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
})

await importAll(basePath('server/commands'))

program.parse()
