import { program } from 'commander';
import modules from '../services/modules.service.ts';

program.command('module:disable')
    .argument('<module>', 'Module to disable')
    .action(async (name) => {
        await modules.disable(name);
    });
