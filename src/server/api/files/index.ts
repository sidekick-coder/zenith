import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'
import { undeleted } from '#server/queries/index.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import db from '#server/facades/db.facade.ts'

export default defineAuthHandler(async ({ acl, query: routeQuery }) => {
    const payload = validator.validate(routeQuery, v => v.intersect([
        schemas.pagination.schema,
        schemas.file.filters
    ]))

    acl.authorize('read', 'File')

    let query = db.selectFrom('files as f')
        .selectAll('f')
        .where(undeleted)
        .orderBy('created_at', 'desc')

    if (payload.id?.length) {
        query = query.where('f.id', 'in', payload.id)
    }

    if (payload.search) {
        query = query.where('f.client_name', 'like', `%${payload.search}%`)
    }

    if (payload.purpose?.length) {
        query = query.where('f.purpose', 'in', payload.purpose)
    }

    if (payload.client_name?.length) {
        query = query.where('f.client_name', 'in', payload.client_name)
    }

    if (payload.metas) {
        query = payload.metas.apply(query)
    }

    const pagination = await File.paginate({
        limit: payload.limit,
        page: payload.page,
        query: () => query,
    })

    if (payload.include?.includes('metas')) {
        await File.loadMetas(pagination.items)
    }

    if (payload.include?.includes('url')) {
        await File.loadUrls(pagination.items)
    }

    return pagination
})
