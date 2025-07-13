import { program } from 'commander';
import migrator from '../database/migrator.ts';
import cli from '../services/cli.service.ts';

program.command('migration:rollback-folder')
    .helpGroup('migration')
    .argument('<folderPath>', 'Folder path to rollback')
    .action(async (folderPath) => {
        const results = await migrator.rollbackFolder(folderPath);

        if (results.length === 0) {
            console.log('No migrations found in folder');
            return;
        }

        cli.ui.table(results);
    });
