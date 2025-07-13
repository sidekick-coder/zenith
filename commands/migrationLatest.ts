import { program } from 'commander';
import migrator from '../database/migrator.ts';
import chalk from 'chalk';
import cli from '../services/cli.service.ts';

program.command('migration:latest')
    .action(async () => {
        const { error, results } = await migrator.latest();

        if (error) {
            console.error(error);
        }

        if (results?.length) {
            cli.ui.table(results)
        }
    });
