import fs from 'fs'
import path from 'path'
import { format } from 'date-fns'
import { basePath } from '#server/utils/paths.ts'
import modules from '#server/facades/modules.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import db from '#server/facades/db.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'

export interface Migration {
    name: string;
    module: string | null;
    filePath: string;
    executedAt: Date | null;
    up: (db: any) => Promise<void>;
    down: (db: any) => Promise<void>;
}

export interface ListFilters {
    root?: boolean;
    module?: string;
}

interface MigrationResult {
    filename: string;
    module: string | null;
    result: 'success' | 'failed';
    errorMessage?: string;
    error?: any;
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

    public async list(filters?: ListFilters): Promise<Migration[]> {
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
        
        let migrations = allMigrations.map(migration => ({
            ...migration,
            executedAt: executedMap.get(migration.name) || null
        }))
        
        if (filters?.root) {
            migrations = migrations.filter(m => m.module === null)
        }

        if (filters?.module) {
            migrations = migrations.filter(m => m.module === filters.module)
        }

        return migrations
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
                errorMessage: `Migration ${fileName} not found`
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
                errorMessage: error instanceof Error ? error.message : String(error),
                error
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

    public async migrate(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()
        
        let migrations = await this.list(filters)
        
        migrations = migrations.filter(m => !m.executedAt)

        migrations.sort((a, b) => a.name.localeCompare(b.name))

        if (filters.steps !== undefined) {
            migrations = migrations.slice(0, filters.steps)
        }


        if (migrations.length === 0) {
            return []
        }

        await emmitter.emitAndWait('migrator:before-migrate', { 
            migrations: migrations.map(m => m.name)
        })

        const results: MigrationResult[] = []

        for (const migration of migrations) {
            const result = await this.migrateFile(migration.name)
            
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        await emmitter.emitAndWait('migrator:after-migrate', { 
            migrations: migrations,
            results
        })

        return results
    }

    public async rollback(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        await this.ensureMigrationsTable()
        
        let migrations = await this.list(filters)
        
        migrations = migrations.filter(m => m.executedAt)

        migrations.sort((a, b) => b.name.localeCompare(a.name))
        

        if (filters.steps !== undefined) {
            migrations = migrations.slice(0, filters.steps)
        }

        if (migrations.length === 0) {
            return []
        }

        await emmitter.emitAndWait('migrator:before-rollback', { 
            migrations: migrations.map(m => m.name)
        })

        const results: MigrationResult[] = []
        
        for (const migration of migrations) {
            const result = await this.rollbackFile(migration.name)
            
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        await emmitter.emitAndWait('migrator:after-rollback', { 
            migrations: migrations.map(m => m.name)
        })

        return results
    }

    public async up(steps: number = 1, filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.migrate({ 
            ...filters,
            steps 
        })
    }

    public async down(steps: number = 1, filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.rollback({ 
            ...filters,
            steps 
        })
    }

    public async latest(filters: ListFilters = {}): Promise<MigrationResult[]> {
        return this.migrate(filters)
    }

    public async latestOrFail(filters: ListFilters = {}): Promise<MigrationResult[]> {
        const results = await this.latest(filters)
        
        if (results.some(r => r.result === 'failed')) {
            const error = new Error('Failed to run all migrations')

            Object.assign(error, { results })

            throw error
        }

        return results
    }

    public async fresh(filters: ListFilters & { steps?: number } = {}): Promise<MigrationResult[]> {
        const downResults = await this.rollback(filters)
        
        if (downResults.some(r => r.result === 'failed')) {
            return downResults
        }

        const upResults = await this.migrate(filters)
        
        return upResults
    }

}
