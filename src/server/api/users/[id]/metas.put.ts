import { defineAuthHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import UserMeta from '#server/entities/userMeta.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ params, body, acl }) => {
    const userId = validator.validate(params.id, v => v.extras.url.number())
    const user = await userRepository.findByIdOrFail(userId)

    acl.authorize('update', user)

    const payload = validator.validate(body, v => v.union([
        schemas.userMeta.create,
        v.array(schemas.userMeta.create)
    ]))

    const items = Array.isArray(payload) ? payload : [payload]

    for await (const item of items) {
        await UserMeta.updateOrCreate({
            where: eb => eb.and({
                user_id: userId,
                name: item.name
            }),
            values: {
                user_id: userId,
                name: item.name,
                value: item.value
            }
        })
    }

    return payload
})
