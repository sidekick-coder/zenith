import { program } from 'commander';
import build from '../services/build.service.ts';

program.command('build')
    .action(async (name) => {
        await build.prepare();
    });
