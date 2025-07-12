import { program } from 'commander';
import modules from '../services/modules.service.ts';

program.command('module:toggle')
    .argument('<module>', 'Module to toggle')
    .option('-b, --build', 'Build after toggling the module')
    .action(async (name, options) => {
        await modules.toggle(name, options);
    });
