import { defineHandler, userRepository } from '@sidekick-coder/zenith-kit/server'
import { BaseException, validator } from '@sidekick-coder/zenith-kit/shared'

export default defineHandler(async ({ params, acl, body }) => {
    const id = validator.validate(params.id, v => v.extras.number())

    const payload = validator.validate(body, (v) => {
        const base  = v.object({
            currentPassword: v.string(),
            password: v.pipe(v.string(), v.minLength(6)),
            confirmPassword: v.string(),
        })

        return v.pipe(base,
            v.forward(
                v.partialCheck(
                    [['password'], ['confirmPassword']],
                    (input) => input.password === input.confirmPassword,
                    $t('Passwords do not match')
                ),
                ['confirmPassword']
            ))
    })

    const user = await userRepository.findByIdOrFail(id)

    acl.authorize('update', 'User', user)
    
    if (!user) {
        throw new BaseException('User not found', 404)
    }

    await userRepository.updateById(id, { password: payload.password })

    return { success: true }
})
