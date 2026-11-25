import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)

    const payload = validator.validate(body, v => v.object({
        name: v.optional(v.pipe(v.string(), v.minLength(3))),
        description: v.optional(v.string()),
    }))

    const role = await Role.findOrFail(id)

    acl.authorize('update', role)

    await Role.updateById(id, payload)

    role.merge(payload)

    return role
})
