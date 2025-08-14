import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'

await importAll(basePath('server/commands'))

program.parse()
