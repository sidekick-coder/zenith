import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import UserRole from '#server/entities/userRole.entity.ts'

export default defineAuthHandler(async ({ body, params, acl }) => {
    const userId = validator.validate(params.id, schemas.url.number())
    const payload = validator.validate(body, v => v.object({ role_id: v.number(), }))

    const user = await userRepository.findByIdOrFail(userId)

    const userRole = {
        user_id: user.id,
        role_id: payload.role_id,
    }

    acl.authorize('create', 'UserRole', userRole)

    await UserRole.updateOrCreate({
        where: eb => eb.and(userRole),
        values: userRole
    })

    return { success: true }
})
