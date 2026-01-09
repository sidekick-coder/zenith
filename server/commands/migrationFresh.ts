import { program } from 'commander'
import { confirm } from '@inquirer/prompts'
import migrator from '#server/facades/migrator.facade.ts'
import { table } from '#server/utils/cliUi.ts'

program.command('migration:fresh')
    .helpGroup('migration')
    .description('Rollback all migrations and re-run them')
    .option('-m, --module <string>', 'Filter by module name')
    .option('-r, --root', 'Run migrations only for the root application')
    .option('-s, --steps <number>', 'Number of migrations to rollback before running fresh', Number)
    .action(async (options: { module?: string, root?: boolean, steps?: number }) => {
        if (!options.steps) {
            const confirmed = await confirm({
                message: 'Are you sure you want to rollback all migrations and re-run them?',
                default: false
            })

            if (!confirmed) {
                console.log('Migration fresh cancelled')
                return
            }

        }

        const results = await migrator.fresh({
            module: options.module,
            steps: options.steps,
            root: !!options.root
        })

        if (!results.length) {
            console.log('No migrations to run')
            return
        }

        table(results)
    })
