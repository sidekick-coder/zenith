import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import db from '#server/facades/db.facade.ts'

await db.load()

await importAll(basePath('console/commands'))

program.parse()
