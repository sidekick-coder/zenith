import path from 'path'
import migrator from '#server/facades/migrator.facade.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import { basePath } from '#server/utils/paths.ts'

const router = root.use(authMiddleware)
    .prefix('/api/migrations')
    .group()

router.get('/', async ({ acl, query }) => {
    acl.authorize('list', 'Migration')

    const payload = validator.validate(query, v => v.object({
        module: v.optional(v.string()),
        root: v.optional(v.pipe(v.string(), v.transform(v => v === 'true'))),
    }))

    const migrations = await migrator.list({
        module: payload.module,
        root: payload.root,
    })

    return migrations.map(m => ({
        name: m.name,
        module: m.module,
        filename: path.relative(basePath(), m.filePath),
        status: m.executedAt ? 'executed' : 'pending',
        executedAt: m.executedAt,
    }))
})

router.post('/migrate', async ({ acl, body }) => {
    acl.authorize('migrate', 'Migration')

    const payload = validator.validate(body, v => v.object({
        module: v.optional(v.string()),
        root: v.optional(v.boolean()),
        steps: v.optional(v.pipe(v.number(), v.integer())),
    }))

    const results = await migrator.migrate(payload)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.errorMessage ?? 'Migration failed')
    }

    return results
})

router.post('/rollback', async ({ acl, body }) => {
    acl.authorize('rollback', 'Migration')

    const payload = validator.validate(body, v => v.object({
        module: v.optional(v.string()),
        root: v.optional(v.boolean()),
        steps: v.optional(v.pipe(v.number(), v.integer())),
    }))

    const results = await migrator.rollback(payload)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.errorMessage ?? 'Rollback failed')
    }

    return results
})

router.post('/up', async ({ acl, body }) => {
    acl.authorize('migrate', 'Migration')

    const payload = validator.validate(body, v => v.object({
        steps: v.optional(v.pipe(v.number(), v.integer()), 1),
        module: v.optional(v.string()),
        root: v.optional(v.boolean()),
    }))

    const { steps, ...filters } = payload

    const results = await migrator.up(steps, filters)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.errorMessage ?? 'Migration failed')
    }

    return results
})

router.post('/down', async ({ acl, body }) => {
    acl.authorize('rollback', 'Migration')

    const payload = validator.validate(body, v => v.object({
        steps: v.optional(v.pipe(v.number(), v.integer()), 1),
        module: v.optional(v.string()),
        root: v.optional(v.boolean()),
    }))

    const { steps, ...filters } = payload

    const results = await migrator.down(steps, filters)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.errorMessage ?? 'Rollback failed')
    }

    return results
})

router.post('/fresh', async ({ acl, body }) => {
    acl.authorize('fresh', 'Migration')

    const payload = validator.validate(body, v => v.object({
        module: v.optional(v.string()),
        root: v.optional(v.boolean()),
        steps: v.optional(v.pipe(v.number(), v.integer())),
    }))

    const results = await migrator.fresh(payload)

    const failed = results.find(r => r.result === 'failed')

    if (failed) {
        throw new BaseException(failed.errorMessage ?? 'Fresh migration failed')
    }

    return results
})

router.post('/:name/migrate', async ({ params, acl }) => {
    acl.authorize('migrate', 'Migration')

    const result = await migrator.migrateFile(params.name)

    if (result.result === 'failed') {
        throw new BaseException(result.errorMessage ?? 'Migration failed')
    }

    return result
})

router.post('/:name/rollback', async ({ params, acl }) => {
    acl.authorize('rollback', 'Migration')

    const result = await migrator.rollbackFile(params.name)

    if (result.result === 'failed') {
        throw new BaseException(result.errorMessage ?? 'Rollback failed')
    }

    return result
})
