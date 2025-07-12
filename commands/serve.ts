import { program } from 'commander';
import cp from 'child_process';
import fs from 'fs';
import { basePath } from '../utils/paths.ts';
import { logger } from '../logger.ts';

program.command('serve').option('-w, --watch', 'Watch for changes and restart server').action((options) => {
    const bin = 'node';

    const args = [
        '--no-warnings',
        '--experimental-strip-types',
    ];

    const ignore = ['app', 'node_modules', '.git', 'logs', 'modules'];

    const watchDirs = fs.readdirSync(basePath()).filter(dir => !ignore.includes(dir));

    const modules = fs.readdirSync(basePath('modules')).filter(dir => !ignore.includes(dir));

    for (const module of modules) {
        const modulePaths = fs.readdirSync(basePath(`modules/${module}`)).filter(dir => !ignore.includes(dir));

        watchDirs.push(...modulePaths.map(path => `modules/${module}/${path}`));
    }


    if (options.watch) {
        args.push('--watch');
        watchDirs.forEach(dir => {
            args.push(`--watch-path=./${dir}`);
        });
    }

    args.push('index.ts');

    cp.spawn(bin, args, {
        stdio: 'inherit',
        shell: true,
    });

    if (options.watch) {
        logger.info('Watching for changes...', watchDirs);
    }
});
