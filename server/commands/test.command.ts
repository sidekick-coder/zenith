import { spawn } from 'child_process'
import { program } from 'commander'
import { basePath } from '#server/utils/paths.ts'

program.command('test')
    .helpGroup('test')
    .description('Run tests using vitest')
    .option('-t, --type <type>', 'Test type to run (unit, int)', 'unit')
    .option('-w, --watch', 'Run in watch mode')
    .option('-p, --pattern <pattern>', 'Filter tests by pattern')
    .action(async (options) => {
        const args = ['vitest']

        if (options.watch) {
            args[1] = 'watch'
        }

        if (options.type === 'unit') {
            args.push('--exclude', '**/*.int.test.ts')
        }

        if (options.type === 'int') {
            args.push('--exclude', '**/*.unit.test.ts')
        }

        if (options.pattern) {
            args.push('-t', options.pattern)
        }

        args.push('--exclude', '**/modules/**')

        const child = spawn('npx', args, {
            cwd: basePath(),
            stdio: 'inherit',
            shell: true,
        })

        child.on('close', (code) => {
            process.exit(code ?? 0)
        })
    })
