import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program.command('migration:module')
    .helpGroup('migration')
    .argument('<moduleName>', 'Module name to migrate')
    .action(async (moduleName) => {
        const results = await migrator.migrateByModule(moduleName);

        if (results.length === 0) {
            console.log(`No pending migrations found for module: ${moduleName}`);
            return;
        }

        cli.ui.table(results);
    });
