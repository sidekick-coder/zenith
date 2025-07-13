import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program.command('migration:rollback-file')
    .helpGroup('migration')
    .argument('<fileName>', 'Migration file name to rollback')
    .action(async (fileName) => {
        const result = await migrator.rollbackFile(fileName);

        cli.ui.table([result]);
    });
