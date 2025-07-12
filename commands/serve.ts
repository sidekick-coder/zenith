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

    const ignore = ['client', 'dist', 'node_modules', '.git', 'logs'];

    const watchDirs = fs.readdirSync(basePath()).filter(dir => !ignore.includes(dir));

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
        console.log('Watching for changes...');
    }
});
