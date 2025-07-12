import { program } from 'commander';
import { importAll } from '../utils/importAll.ts';
import { basePath } from '../utils/paths.ts';

await importAll(basePath('commands'))

program.parse()
