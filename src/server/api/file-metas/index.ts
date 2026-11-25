import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import { undeleted } from '#server/queries/index.ts'
import db from '#server/facades/db.facade.ts'

export default defineAuthHandler(async ({ acl, query: routeQuery }) => {
    acl.authorize('read', 'FileMeta')

    const payload = validator.validate(routeQuery, v => v.intersect([
        schemas.pagination.schema,
        v.object({
            file_id: v.optional(schemas.query.number()),
            name: v.optional(v.string()),
            value: v.optional(v.string()),
        })
    ]))

    let query = db.selectFrom('file_metas as fm')
        .selectAll('fm')
        .innerJoin('files as f', 'fm.file_id', 'f.id')
        .where(undeleted.column('fm.deleted_at'))
        .where(undeleted.column('f.deleted_at'))
        .orderBy('fm.created_at', 'desc')

    if (payload.file_id) {
        query = query.where('fm.file_id', '=', payload.file_id)
    }

    if (payload.name) {
        query = query.where('fm.name', '=', payload.name)
    }

    if (payload.value) {
        query = query.where('fm.value', '=', payload.value)
    }

    return FileMeta.paginate({
        page: payload.page,
        limit: payload.limit,
        query: () => query
    })
})
