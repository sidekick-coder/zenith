import { program } from 'commander';
import modules from '../services/modules.service.ts';

program.command('module:enable')
    .argument('<module>', 'Module to enable')
    .action(async (name) => {
        await modules.enable(name);
    });
