import { program } from 'commander';
import migrator from '#server/facades/migrator.facade.ts';
import cli from '#server/services/cli.service.ts';

program.command('migration:rollback-file')
    .helpGroup('migration')
    .argument('<fileName>', 'Migration file name to rollback')
    .action(async (fileName) => {
        const result = await migrator.rollbackFile(fileName);

        cli.ui.table([result]);
    });
