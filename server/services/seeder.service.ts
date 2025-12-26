import fs from 'fs'
import path from 'path'
import { basePath } from '#server/utils/paths.ts'
import modules from '#server/facades/modules.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import db from '#server/facades/db.facade.ts'

export interface Seed {
    id: string
    name: string
    module: string | null
    filePath: string
}

export interface ListFilters {
    root?: boolean
    module?: string
    name?: string | string[]
}

interface SeedResult {
    filename: string
    module: string | null
    result: 'success' | 'failed'
    errorMessage?: string
    error?: any
}

export default class SeederService {
    public async list(filters?: ListFilters): Promise<Seed[]> {
        const allSeeds: Seed[] = []

        // Load root seeds
        const rootFolder = basePath('server', 'seeds')

        const entries = await fs.promises.readdir(rootFolder)
        
        for (const entry of entries) {
            if (!entry.endsWith('.js') && !entry.endsWith('.ts')) continue

            const fullPath = path.join(rootFolder, entry)

            allSeeds.push({
                id: fullPath,
                name: path.basename(entry, path.extname(entry)),
                module: null,
                filePath: fullPath,
            })
        }

        // Load module seeds
        const mods = await modules.list()

        for (const mod of mods) {
            const seedPath = mod.makePath('server', 'seeds')
            
            if (!fs.existsSync(seedPath)) continue

            const entries = await fs.promises.readdir(seedPath)
            
            for (const entry of entries) {
                if (!entry.endsWith('.js') && !entry.endsWith('.ts')) continue

                const fullPath = path.join(seedPath, entry)

                allSeeds.push({
                    id: fullPath,
                    name: path.basename(entry, path.extname(entry)),
                    module: mod.name,
                    filePath: fullPath,
                })
            }
        }

        // Sort all seeds by name
        allSeeds.sort((a, b) => a.name.localeCompare(b.name))

        let seeds = allSeeds
        
        if (filters?.root) {
            seeds = seeds.filter(s => s.module === null)
        }

        if (filters?.module) {
            seeds = seeds.filter(s => s.module === filters.module)
        }

        if (filters?.name) {
            const names = Array.isArray(filters.name) ? filters.name : [filters.name]
            
            seeds = seeds.filter(s => names.some(name => s.name.includes(name)))
        }


        return seeds
    }

    public async runFile(id: string): Promise<SeedResult> {
        const seeds = await this.list()
        const seed = seeds.find(s => s.id === id)

        if (!seed) {
            return {
                filename: id,
                module: null,
                result: 'failed',
                errorMessage: `Seed ${id} not found`
            }
        }

        const [error, seedModule] = await tryCatch(() => import(seed.filePath))

        if (error) {
            return {
                filename: id,
                module: seed.module,
                result: 'failed',
                errorMessage: `Failed to load seed: ${error instanceof Error ? error.message : String(error)}`,
                error
            }
        }

        if (!seedModule.run || typeof seedModule.run !== 'function') {
            return {
                filename: id,
                module: seed.module,
                result: 'failed',
                errorMessage: `Seed file ${id} must export a 'run' function`
            }
        }

        try {            
            await seedModule.run(db)

            return {
                filename: seed.name,
                module: seed.module,
                result: 'success'
            }
        } catch (error) {
            return {
                filename: seed.name,
                module: seed.module,
                result: 'failed',
                errorMessage: error instanceof Error ? error.message : String(error),
                error
            }
        }
    }

    public async run(filters: ListFilters = {}): Promise<SeedResult[]> {
        const seeds = await this.list(filters)

        if (seeds.length === 0) {
            return []
        }

        const results: SeedResult[] = []

        for (const seed of seeds) {
            const result = await this.runFile(seed.id)
            
            results.push(result)
            
            // Stop on first failure
            if (result.result === 'failed') {
                break
            }
        }

        return results
    }
}