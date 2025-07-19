import { program } from 'commander';
import { db } from '../database/db.ts';
import fs from 'fs';
import { basePath } from '../utils/paths.ts';

async function runSeed(seedPath: string, seedName: string, moduleName?: string): Promise<void> {
    const moduleInfo = moduleName ? ` (module: ${moduleName})` : '';
    console.log(`Running seed: ${seedName}${moduleInfo}`);
    
    // Import the seed file
    const seedModule = await import(seedPath);
    
    if (!seedModule.run || typeof seedModule.run !== 'function') {
        throw new Error(`Seed file ${seedName} must export a 'run' function`);
    }
    
    // Run the seed
    await seedModule.run(db);
    
    console.log(`✓ Completed seed: ${seedName}${moduleInfo}`);
}

program.command('seed:run')
    .helpGroup('database')
    .description('Run database seed files')
    .argument('<seedName>', 'Name of the seed file to run')
    .option('-m, --module <moduleName>', 'Run seed only from specific module')
    .action(async (seedName, options) => {
        const { module: moduleName } = options;
        
        // If module is specified, only look in that module
        if (moduleName) {
            const seedPath = basePath(`modules/${moduleName}/server/database/seeds/${seedName}.ts`);
            if (!fs.existsSync(seedPath)) {
                console.log(`No seed file found named '${seedName}' in module '${moduleName}'`);
                return;
            }
            await runSeed(seedPath, seedName, moduleName);
            return;
        }
        
        // Check general seeds directory first
        const generalSeedPath = basePath(`database/seeds/${seedName}.ts`);
        if (fs.existsSync(generalSeedPath)) {
            await runSeed(generalSeedPath, seedName);
            return;
        }
        
        // Check all module seeds directories
        const modulesDir = basePath('modules');
        if (fs.existsSync(modulesDir)) {
            const modules = fs.readdirSync(modulesDir);
            for (const module of modules) {
                const moduleSeedPath = basePath(`modules/${module}/server/database/seeds/${seedName}.ts`);
                if (fs.existsSync(moduleSeedPath)) {
                    await runSeed(moduleSeedPath, seedName, module);
                    return;
                }
            }
        }
        
        console.log(`No seed file found named '${seedName}'`);
    });
