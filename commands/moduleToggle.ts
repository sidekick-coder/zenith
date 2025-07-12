import { program } from 'commander';
import modules from '../services/modules.service.ts';

program.command('module:toggle')
    .argument('<module>', 'Module to toggle')
    .action(async (name) => {
        await modules.toggle(name);
    });
