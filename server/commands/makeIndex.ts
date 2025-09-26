import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import { camelCase } from 'lodash-es'

program.command('make:index')
    .requiredOption('-d, --directory <directory>', 'Directory to where generate index.ts file')
    .option('-n, --name <name>', 'Name of export object', 'schemas')
    .option('--strip-suffix <stripSuffix>', 'Strip suffix from import names')
    .action(async (options) => {
        const { directory, name, stripSuffix } = options
        
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
        
        // Generate imports
        const imports = files.map(file => {
            return `import * as ${camelCase(file.split('.')[0])} from './${file}'`
        }).join('\n')
        
        // Generate const object with all imports
        const objectEntries = files.map(file => {
            return `    ${camelCase(file.split('.')[0])},`
        }).join('\n')
        
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
        
        // Write index.ts file
        const indexPath = path.join(directory, 'index.ts')
        fs.writeFileSync(indexPath, indexContent)
        
        console.log(`✅ Generated index.ts in ${directory}`)
        console.log(`📝 Imported ${files.length} files into "${name}" object`)
    })
