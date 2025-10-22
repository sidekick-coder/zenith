import fs from 'fs'
import { program } from 'commander'
import { basePath, serverPath } from '#server/utils/paths.ts'
import db from '#server/facades/db.facade.ts'
import cli from '#server/services/cli.service.ts'

async function runSeed(seedPath: string, seedName: string, moduleName?: string): Promise<void> {
    const moduleInfo = moduleName ? ` (module: ${moduleName})` : ''
    console.log(`Running seed: ${seedName}${moduleInfo}`)
    
    // Import the seed file
    const seedModule = await import(seedPath)
    
    if (!seedModule.run || typeof seedModule.run !== 'function') {
        throw new Error(`Seed file ${seedName} must export a 'run' function`)
    }
    
    // Run the seed
    await seedModule.run(db)
    
    console.log(`✓ Completed seed: ${seedName}${moduleInfo}`)
}

function findSeedPath(seedName: string, moduleName?: string): string | null {
    const extensions = ['.ts', '.js', '.seed.ts', '.seed.js']

    if (moduleName) {
        for (const ext of extensions) {
            const moduleSeedPath = basePath(`modules/${moduleName}/server/seeds/${seedName}${ext}`)
            if (fs.existsSync(moduleSeedPath)) {
                return moduleSeedPath
            }
        }
        return null
    }

    // Check general seeds directory first
    for (const ext of extensions) {
        const generalSeedPath = serverPath(`seeds/${seedName}${ext}`)

        if (fs.existsSync(generalSeedPath)) {
            return generalSeedPath
        }
    }

    return null
}

program.command('seed:run')
    .helpGroup('database')
    .description('Run database seed files')
    .argument('<seedName>', 'Name of the seed file to run')
    .option('-m, --module <moduleName>', 'Run seed only from specific module')
    .action(cli.with(['db'], async (seedName, options) => {
        const { module: moduleName } = options
        
        const seedPath = findSeedPath(seedName, moduleName)

        // If module is specified, only look in that module
        if (!seedPath) {
            console.log(`No seed file found named '${seedName}'`)
            return
        }

        await runSeed(seedPath, seedName, moduleName)
    }))
