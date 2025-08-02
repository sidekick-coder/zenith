import { program } from 'commander';
import modules from '#server/services/modules.service.ts';

program.command('module:disable')
    .helpGroup('module')
    .argument('<module>', 'Module to disable')
    .action(async (name) => {
        await modules.disable(name);
    });
