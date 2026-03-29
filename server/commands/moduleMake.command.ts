import fs from 'fs'
import path from 'path'
import { camelCase } from 'lodash-es'
import template from '#server/facades/template.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import arte from '#server/facades/arte.facade.ts'

async function copyTemplateDirectory(sourceDir: string, targetDir: string, templateData: Record<string, any>) {
    if (!fs.existsSync(targetDir)) {
        await fs.promises.mkdir(targetDir, { recursive: true })
    }

    const entries = await fs.promises.readdir(sourceDir, { withFileTypes: true })

    for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name)
        const targetPath = path.join(targetDir, entry.name)

        if (entry.isDirectory()) {
            await copyTemplateDirectory(sourcePath, targetPath, templateData)
        }

        if (entry.isFile()) {
            const contents = await fs.promises.readFile(sourcePath, 'utf-8')
            const processedContents = template.render(contents, templateData)
            
            // Remove .ejs extension from the target file name if it exists
            let finalTargetPath = targetPath
            if (entry.name.endsWith('.ejs')) {
                finalTargetPath = targetPath.replace(/\.ejs$/, '')
            }
            
            if (!fs.existsSync(path.dirname(finalTargetPath))) {
                await fs.promises.mkdir(path.dirname(finalTargetPath), { recursive: true })
            }
            
            await fs.promises.writeFile(finalTargetPath, processedContents, 'utf-8')
        }
    }
}

arte
    .command('module:make')
    .helpGroup('module')
    .argument('<module>', 'Module to create')
    .action(async (name) => {
        const templateDir = basePath('server', 'templates', 'module')
        const targetDir = basePath('modules', name)
        
        if (fs.existsSync(targetDir)) {
            console.error(`Module "${name}" already exists at ${targetDir}`)
            process.exit(1)
        }

        if (!fs.existsSync(templateDir)) {
            console.error(`Template directory not found at ${templateDir}`)
            process.exit(1)
        }

        console.log(`Creating module "${name}"...`)

        const templateData = {
            name,
            camelCaseName: camelCase(name),
        }
        
        await copyTemplateDirectory(templateDir, targetDir, templateData)
        
        console.log(`Module "${name}" created successfully at ${path.relative(process.cwd(), targetDir)}`)
    })
