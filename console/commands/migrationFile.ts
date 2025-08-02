import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program
    .command('migration:file')
    .helpGroup('migration')
    .argument('<fileName>', 'Migration file name')
    .action(async (fileName) => {
        const result = await migrator.migrateFile(fileName);

        cli.ui.table([result]);
    });
