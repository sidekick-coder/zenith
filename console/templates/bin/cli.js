import { program } from 'commander'
import { importAll } from '#utils/importAll.ts'
import { basePath } from '#utils/paths.ts'
import db from '#facades/db.ts'

await db.load()

await importAll(basePath('commands'))

program.parse()
