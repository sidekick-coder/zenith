import { program } from 'commander';
import { importAll } from '../utils/importAll.ts';
import { basePath } from '../utils/paths.ts';
import dbManager from '../database/manager.ts';

await dbManager.load();

await importAll(basePath('commands'))

program.parse()
