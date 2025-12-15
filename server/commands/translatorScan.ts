import { readFile, writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import { program } from 'commander'
import { input } from '@inquirer/prompts'
import { glob } from 'glob'
import chalk from 'chalk'

program.command('translations:scan')
    .helpGroup('translations')
    .description('Scan files for translation keys and generate a JSON file')
    .option('-d, --directory <directory>', 'Directory to scan')
    .option('-o, --output <output>', 'Output filename')
    .option('-i, --ignore <patterns...>', 'Additional patterns to ignore')
    .action(async (options) => {
        let directory = options.directory

        if (!directory) {
            directory = await input({
                message: 'Enter the directory to scan:',
                default: './client',
            })
        }

        let outputFilename = options.output

        if (!outputFilename) {
            outputFilename = await input({
                message: 'Enter the output filename:',
                default: 'translations.json',
            })
        }

        const resolvedDirectory = resolve(directory)
        console.log(chalk.blue(`Scanning directory: ${resolvedDirectory}`))

        const defaultIgnorePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/storage/**',
            '**/client-dist/**',
            '**/tmp/**',
            '**/*.d.ts',
        ]

        const customIgnorePatterns = options.ignore || []
        const allIgnorePatterns = [...defaultIgnorePatterns, ...customIgnorePatterns]

        const files = await glob('**/*.{vue,ts,js}', {
            cwd: resolvedDirectory,
            absolute: true,
            ignore: allIgnorePatterns,
        })

        console.log(chalk.blue(`Found ${files.length} files to scan`))

        const translationKeys = new Set<string>()
        const pattern = /\$t\(['"]([^'"]+)['"]\)/g

        for (const file of files) {
            const content = await readFile(file, 'utf-8')
            const matches = content.matchAll(pattern)

            for (const match of matches) {
                translationKeys.add(match[1])
            }
        }

        console.log(chalk.green(`Found ${translationKeys.size} unique translation keys`))

        const outputPath = resolve(outputFilename)
        
        // Check if file exists and load existing translations
        let existingTranslations: Record<string, string> = {}
        if (existsSync(outputPath)) {
            console.log(chalk.blue(`Loading existing translations from: ${outputPath}`))
            const existingContent = await readFile(outputPath, 'utf-8')
            existingTranslations = JSON.parse(existingContent)
        }

        // Merge translations: preserve existing values, add new keys with empty strings
        const translationObject: Record<string, string> = {}
        Array.from(translationKeys).forEach(key => {
            translationObject[key] = existingTranslations[key] ?? ''
        })

        // Sort keys alphabetically
        const sortedTranslations: Record<string, string> = {}
        Object.keys(translationObject).sort()
            .forEach(key => {
                sortedTranslations[key] = translationObject[key]
            })

        await writeFile(
            outputPath,
            JSON.stringify(sortedTranslations, null, 2),
            'utf-8'
        )

        const newKeysCount = Array.from(translationKeys).filter(key => !(key in existingTranslations)).length
        
        console.log(chalk.green(`✓ Translation keys written to: ${outputPath}`))
        console.log(chalk.dim(`  Total keys: ${translationKeys.size}`))
        console.log(chalk.dim(`  New keys: ${newKeysCount}`))
    })
