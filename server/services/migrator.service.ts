import fs from 'fs'
import path from 'path'
import { basePath } from '#server/utils/paths.ts'
import modules from '#server/services/modules.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import db from '#server/facades/db.facade.ts'
import { format } from 'date-fns'

interface Migration {
    name: string;
    module: string | null;
    filePath: string;
    executedAt: Date | null;
    up: (db: any) => Promise<void>;
    down: (db: any) => Promise<void>;
}

interface MigrationResult {
    filename: string;
    module: string | null;
    result: 'success' | 'failed';
    error?: string;
}

export default class MigratorService {
    private async ensureMigrationsTable() {
        await db.schema
            .createTable('migrations')
            .ifNotExists()
            .addColumn('name', 'varchar(255)', (col) => col.primaryKey())
            .addColumn('module', 'varchar(255)')
            .addColumn('executed_at', 'timestamp', (col) => col.notNull())
            .execute()
    }

    public async list(): Promise<Migration[]> {
        await this.ensureMigrationsTable()

        const allMigrations: Migration[] = []

        // Load root migrations
        const rootFolder = basePath('server', 'migrations')
        if (fs.existsSync(rootFolder)) {
            const entries = await fs.promises.readdir(rootFolder)
            
            for (const entry of entries) {
                if (!entry.endsWith('.js') && !entry.endsWith('.ts')) continue

                const fullPath = path.join(rootFolder, entry)
                const filename = path.basename(entry, path.extname(entry))

                const [error, migration] = await tryCatch(() => import(fullPath))

                if (error) {
                    console.warn(`Failed to load migration ${filename}:`, error)
                    continue
                }

                allMigrations.push({
                    name: filename,
                    module: null,
                    filePath: fullPath,
                    executedAt: null,
                    up: migration.up,
                    down: migration.down,
                })
            }
        }

        // Load module migrations
        const mods = await modules.list()
        for (const mod of mods) {
            const migrationPath = mod.makePath('server', 'migrations')
            if (!fs.existsSync(migrationPath)) continue

            const entries = await fs.promises.readdir(migrationPath)
            
            for (const entry of entries) {
                if (!entry.endsWith('.js') && !entry.endsWith('.ts')) continue

                const fullPath = path.join(migrationPath, entry)
                const filename = path.basename(entry, path.extname(entry))

                const [error, migration] = await tryCatch(() => import(fullPath))

                if (error) {
                    console.warn(`Failed to load migration ${filename}:`, error)
                    continue
                }

                allMigrations.push({
                    name: filename,
                    module: mod.name,
                    filePath: fullPath,
                    executedAt: null,
                    up: migration.up,
                    down: migration.down,
                })
            }
        }

        // Sort all migrations by name
        allMigrations.sort((a, b) => a.name.localeCompare(b.name))

        // Get executed migrations from database
        const executedMigrations = await db
            .selectFrom('migrations')
            .selectAll()
            .execute()

        // Mark executed migrations
        const executedMap = new Map(executedMigrations.map(m => [m.name, m.executed_at]))
        
        return allMigrations.map(migration => ({
            ...migration,
            executedAt: executedMap.get(migration.name) || null
        }))
    }

    public async migrateFile(fileName: string): Promise<MigrationResult> {
        await this.ensureMigrationsTable()
        
        const migrations = await this.list()
        const migration = migrations.find(m => m.name === fileName)

        if (!migration) {
            return {
                filename: fileName,
                module: null,
                result: 'failed',
                error: `Migration ${fileName} not found`
            }
        }

        if (migration.executedAt) {
            return {
                filename: fileName,
                module: migration.module,
                result: 'success',
            }
        }

        try {
            await migration.up(db)
            
            await db
                .insertInto('migrations')
                .values({
                    name: migration.name,
                    module: migration.module,
                    executed_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                })
                .execute()

            return {
                filename: migration.name,
                module: migration.module,
                result: 'success'
            }
        } catch (error) {
            return {
                filename: migration.name,
                module: migration.module,
                result: 'failed',
                error: error instanceof Error ? error.message : String(error)
            }
        }
    }

    public async rollbackFile(fileName: string): Promise<MigrationResult> {
        await this.ensureMigrationsTable()
        
        const migrations = await this.list()
        const migration = migrations.find(m => m.name === fileName)

        if (!migration) {
            return {
                filename: fileName,
                module: null,
                result: 'failed',
                error: `Migration ${fileName} not found`
            }
        }

        if (!migration.executedAt) {
            return {
                filename: fileName,
                module: migration.module,
                result: 'success',
            }
        }

        try {
            await migration.down(db)
            
            await db
                .deleteFrom('migrations')
                .where('name', '=', migration.name)
                .execute()

            return {
                filename: migration.name,
                module: migration.module,
                result: 'success'
            }
        } catch (error) {
            return {
                filename: migration.name,
                module: migration.module,
                result: 'failed',
                error: error instanceof Error ? error.message : String(error)
            }
        }
    }

    

    public async migrateFolder(folderPath: string): Promise<MigrationResult[]> {
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Folder ${folderPath} does not exist`)
        }

        const entries = await fs.promises.readdir(folderPath)

        const migrationFiles = entries
            .filter(entry => entry.endsWith('.js') || entry.endsWith('.ts'))
            .map(entry => path.basename(entry, path.extname(entry)))
            .sort()

        if (migrationFiles.length === 0) {
            return []
        }

        const allResults: MigrationResult[] = []

        for (const fileName of migrationFiles) {
            const result = await this.migrateFile(fileName)
            allResults.push(result)
            
            // Stop processing if migration failed
            if (result.result === 'failed') {
                break
            }
        }

        return allResults
    }

    public async rollbackFolder(folderPath: string): Promise<MigrationResult[]> {
        if (!fs.existsSync(folderPath)) {
            throw new Error(`Folder ${folderPath} does not exist`)
        }

        const entries = await fs.promises.readdir(folderPath)

        const migrationFiles = entries
            .filter(entry => entry.endsWith('.js') || entry.endsWith('.ts'))
            .map(entry => path.basename(entry, path.extname(entry)))
            .sort()
            .reverse() // Reverse order for rollback

        if (migrationFiles.length === 0) {
            return []
        }

        const allResults: MigrationResult[] = []

        for (const fileName of migrationFiles) {
            const result = await this.rollbackFile(fileName)
            allResults.push(result)
            
            // Stop processing if rollback failed
            if (result.result === 'failed') {
                break
            }
        }

        return allResults
    }

    public async migrateByModule(moduleName: string): Promise<MigrationResult[]> {
        const mod = await modules.findOrFail(moduleName)

        return this.migrateFolder(mod.makePath('server', 'migrations'))
    }

    public async rollbackByModule(moduleName: string): Promise<MigrationResult[]> {
        const mod = await modules.findOrFail(moduleName)

        return this.rollbackFolder(mod.makePath('server', 'migrations'))
    }

    public async up(steps: number = 1): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()
        
        const migrations = await this.list()
        const pendingMigrations = migrations
            .filter(m => !m.executedAt)
            .sort((a, b) => a.name.localeCompare(b.name))

        if (pendingMigrations.length === 0) {
            return []
        }

        const results: MigrationResult[] = []
        const migrationsToProcess = pendingMigrations.slice(0, steps)
        
        for (const migration of migrationsToProcess) {
            const result = await this.migrateFile(migration.name)
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        return results
    }

    public async down(steps: number = 1): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()
        
        const migrations = await this.list()
        const executedMigrations = migrations
            .filter(m => m.executedAt)
            .sort((a, b) => b.name.localeCompare(a.name))

        if (executedMigrations.length === 0) {
            return []
        }

        const results: MigrationResult[] = []
        const migrationsToProcess = executedMigrations.slice(0, steps)
        
        for (const migration of migrationsToProcess) {
            const result = await this.rollbackFile(migration.name)
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        return results
    }

    public async latest(): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()
        
        const migrations = await this.list()
        const pendingMigrations = migrations
            .filter(m => !m.executedAt)
            .sort((a, b) => a.name.localeCompare(b.name))

        if (pendingMigrations.length === 0) {
            return []
        }

        const results: MigrationResult[] = []
        
        for (const migration of pendingMigrations) {
            const result = await this.migrateFile(migration.name)
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        return results
    }

    public async latestOrFail(): Promise<MigrationResult[]> {
        const results = await this.latest()
        
        if (results.some(r => r.result === 'failed')) {
            const error = new Error('Failed to run all migrations')

            Object.assign(error, { results })

            throw error
        }

        return results
    }
}
