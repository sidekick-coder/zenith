import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const role = await Role.findOrFail(id)

    acl.authorize('delete', role)

    await role.softDelete()

    return role
})
