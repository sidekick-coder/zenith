import { readFile, writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { program } from 'commander'
import { input } from '@inquirer/prompts'
import { glob } from 'glob'
import chalk from 'chalk'
import translator from '#server/facades/translator.facade.ts'

program.command('translations:scan')
    .helpGroup('translations')
    .description('Scan files for translation keys and generate a JSON file')
    .option('-d, --directory <directory>', 'Directory to scan')
    .option('-o, --output <output>', 'Output filename')
    .option('-i, --ignore <patterns...>', 'Additional patterns to ignore')
    .action(async (options) => {
        let directory = options.directory
        let output = options.output

        if (!directory) {
            directory = await input({
                message: 'Enter the directory to scan:',
                default: './client',
            })
        }

        if (!output) {
            output = await input({
                message: 'Enter the output filename:',
                default: 'translations.json',
            })
        }

        directory = resolve(directory)
        output = resolve(output)

        const keys = await translator.scan({
            directory: directory,
            exclude: options.ignore
        })

        console.log(chalk.green('keys founded: ', Object.keys(keys).length))

        const result = new Map<string, string>()

        if (output.endsWith('.json') && existsSync(output)) {
            const text = await readFile(output, 'utf-8')
            const json = JSON.parse(text)

            Object.entries<string>(json).forEach(([key, value]) => {
                result.set(key, value)
            })

            console.log(chalk.green('existing keys: ', Object.keys(json).length))
        }

        for (const key of Object.keys(keys)) {
            if (result.has(key)) continue

            result.set(key, '')
        }
        
        // Sort keys alphabetically
        const sorted: Record<string, string> = {}

        Array.from(result.keys())
            .sort()
            .forEach(key => {
                sorted[key] = result.get(key) || ''
            })

        console.log(chalk.green('final keys count: ', Object.keys(sorted).length))

        await writeFile(
            output,
            JSON.stringify(sorted, null, 2),
            'utf-8'
        )
    })
