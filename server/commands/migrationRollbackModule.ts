import { program } from 'commander';
import migrator from '#server/facades/migrator.facade.ts';
import cli from '#server/services/cli.service.ts';

program.command('migration:rollback-module')
    .helpGroup('migration')
    .argument('<moduleName>', 'Module name to rollback')
    .action(async (moduleName) => {
        const results = await migrator.rollbackByModule(moduleName);

        if (results.length === 0) {
            console.log(`No executed migrations found for module: ${moduleName}`);
            return;
        }

        cli.ui.table(results);
    });
