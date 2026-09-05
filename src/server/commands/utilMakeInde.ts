import fs from 'fs'
import path from 'path'
import { camelCase } from 'lodash-es'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

function makeObjectBarrelIndex(files: string[], name = 'all'): string {
    // Generate imports
    const imports = files.map(file => `import * as ${camelCase(file.split('.')[0])} from './${file}'`).join('\n')

    // Generate const object with all imports
    const objectEntries = files.map(file => `    ${camelCase(file.split('.')[0])}`).join(',\n')

    const indexContent = [
        `${imports}`,
        '',
        `const ${name} = {`,
        `${objectEntries}`,
        '}',
        '',
        `export default ${name}`,
        '']
        .join('\n')

    return indexContent
}
function makeReExportBarrelIndex(files: string[]): string {
    // Generate re-exports
    return files.map(file => `export * from './${file}'`).join('\n')
}

const command = new CliCommand('util:make-index')
    .helpGroup('utils')
    .requiredOption('-d, --directory <directory>', 'Directory to where generate index.ts file')
    .option('-m --mode <mode>', 'Mode of index file: "object" or "re-export"', 're-export')
    .option('-n, --name <name>', 'Name of export object', 'all')
    .action(async (options) => {
        const { directory, name, mode } = options

        // Check if directory exists
        if (!fs.existsSync(directory)) {
            console.error(`Error: Directory "${directory}" does not exist.`)
            return
        }

        // Get all files in directory except index.ts
        const files = fs.readdirSync(directory)
            .filter(file => {
                const filePath = path.join(directory, file)
                const stat = fs.statSync(filePath)
                return stat.isFile() && file.endsWith('.ts') && file !== 'index.ts'
            })

        if (files.length === 0) {
            console.log('No TypeScript files found to import.')
            return
        }

        let content = ''

        if (mode === 'object') {
            content = makeObjectBarrelIndex(files, name)
        }

        if (mode === 're-export') {
            content = makeReExportBarrelIndex(files)
        }

        fs.writeFileSync(path.join(directory, 'index.ts'), content, 'utf-8')


        console.log(`✅ Generated index.ts in ${directory}`)
        console.log(`📝 Imported ${files.length} files into "${name}" object`)
    })

export default command
