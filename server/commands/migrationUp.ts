import { program } from 'commander';
import migrator from '#server/facades/migrator.facade.ts';
import cli from '#server/services/cli.service.ts';

program.command('migration:up')
    .helpGroup('migration')
    .description('Run pending migrations')
    .option('-s, --step <number>', 'Number of migrations to run', Number)
    .action(async (options) => {
        const results = await migrator.up(options.step);

        if (results.length === 0) {
            console.log('No pending migrations');
            return;
        }

        cli.ui.table(results);
    });
