import { program } from 'commander';
import drive from '#server/facades/drive.facade.ts';
import cli from '#server/services/cli.service.ts';

program.command('drive:defaults')
    .helpGroup('drive')
    .description('Create default drives if they do not exist')
    .action(async (options) => {

        await drive.createDefaultDrives();

        console.log('Default drives created');
    });
