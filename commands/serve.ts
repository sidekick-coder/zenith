import { program } from 'commander';
import cp from 'child_process';
import fs from 'fs';
import { basePath } from '../utils/paths.ts';

program.command('serve').option('-w, --watch', 'Watch for changes and restart server').action((options) => {
    const bin = 'node';

    const args = [
        '--no-warnings',
        '--experimental-strip-types',

    ];

    const ignore = [
        'app',
        'config',
        'node_modules',
        '.git',
        'logs',
        'modules',
        'package-lock.json',
        'package.json',
        'tsconfig.json',
        'tsconfig.build.json',
    ];

    const entries = fs.readdirSync(basePath()).filter(dir => !ignore.includes(dir));

    const modules = fs.readdirSync(basePath('modules')).filter(dir => !ignore.includes(dir));

    for (const module of modules) {
        const modulePaths = fs.readdirSync(basePath(`modules/${module}`)).filter(dir => !ignore.includes(dir));

        entries.push(...modulePaths.map(path => `modules/${module}/${path}`));
    }

    if (options.watch) {
        args.push('--watch', '--watch-preserve-output');

        entries.forEach(dir => {
            args.push(`--watch-path=./${dir}`);
        });

        console.log(`Watching directories: ${entries.join(', ')}`);
    }

    args.push('index.ts');

    cp.spawn(bin, args, {
        stdio: 'inherit',
        shell: true,
    });
});
