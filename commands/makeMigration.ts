import { program } from 'commander';
import { format, } from 'date-fns';
import { basePath } from '../utils/paths.ts';
import template from '../services/template.service.ts';
import fs from 'fs/promises';

program.command('make:migration')
    .argument('<name>', 'Migration name')
    .action(async (name) => {
        const timesmap = format(new Date(), 'yyyy_MM_dd_HH_mm');

        const migrationName = `${timesmap}_${name}.ts`;

        const filename = basePath('database', 'migrations', migrationName);

        const contents = await template.fromFile(basePath('templates', 'migration.ts'))

        await fs.writeFile(filename, contents)
    });
