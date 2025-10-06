import { program } from 'commander';
import migrator from '#server/facades/migrator.facade.ts';
import cli from '#server/services/cli.service.ts';

program.command('migration:latest')
    .helpGroup('migration')
    .description('Run all pending migrations')
    .action(async () => {
        const results = await migrator.latest();

        if (results.length === 0) {
            console.log('No pending migrations');
            return;
        }

        cli.ui.table(results);
    });
