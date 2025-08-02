import { program } from 'commander';
import migrator from '#server/database/migrator.ts';
import cli from '#server/services/cli.service.ts';

program.command('migration:folder')
    .helpGroup('migration')
    .argument('<folderPath>', 'Folder path to migrate')
    .action(async (folderPath) => {
        const results = await migrator.migrateFolder(folderPath);

        if (results.length === 0) {
            console.log('No migrations found in folder');
            return;
        }

        cli.ui.table(results);
    });
