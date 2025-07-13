import { program } from 'commander';
import modules from '../services/modules.service.ts';

program.command('module:enable')
    .helpGroup('module')
    .argument('<module>', 'Module to enable')
    .action(async (name) => {
        await modules.enable(name);
    });
