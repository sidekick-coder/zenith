import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program.command('migration:down')
    .option('-s, --step <number>', 'Number of steps to migrate up', Number)
    .action(async (options) => {
        const results = [] as any[];

        const step = options.step || 1;

        for await (const _ of Array(step).keys()) {
            const { error, results: stepResults } = await migrator.down();

            if (error) {
                console.error(error);
                return;
            }

            if (stepResults?.length) {
                results.push(...stepResults);
            } else {
                break; // No more migrations to apply
            }
        }

        if (results?.length) {
            cli.ui.table(results)
        }
    });

