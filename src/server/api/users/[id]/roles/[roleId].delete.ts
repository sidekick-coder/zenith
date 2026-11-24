import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import UserRole from '#server/entities/userRole.entity.ts'

export default defineAuthHandler(async ({ params, acl }) => {
    const userId = validator.validate(params.id, schemas.url.number())
    const roleId = validator.validate(params.roleId, schemas.url.number())

    const user = await userRepository.findByIdOrFail(userId)

    const userRole = {
        user_id: user.id,
        role_id: roleId,
    }

    acl.authorize('delete', 'UserRole', userRole)

    const userRoleRecord = await UserRole.findOne({ where: eb => eb.and(userRole) })

    if (userRoleRecord) {
        await UserRole.destroyById(userRoleRecord.id)
    }

    return { success: true }
})
