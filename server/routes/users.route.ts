import { createUser } from '#server/queries/index.ts'
import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import userRepository from '#server/repositories/user.repository.ts'
import validator from '#shared/services/validator.service.ts'
import { $t } from '#shared/lang.ts' 
import schemas from '#shared/validators/index.ts'
import User from '#server/entities/user.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users')
    .group()

router.get('/', async ({ acl, query }) => {
    acl.authorize('read', 'User')

    const payload = validator.validate(query, schemas.pagination.schema)

    return User.paginate({
        page: payload.page,
        limit: payload.limit,
    })
})

router.post('/', async ({ body }) => {
    const payload = validator.validate(body, schemas.user.create)

    const user = await createUser({
        ...payload,
        username: payload.username || payload.email,
        name: payload.name || payload.email,
    })


    return user
})

router.get('/:id', async ({ params, acl }) => {
    const user = await User.findByIdOrFail(Number(params.id))

    acl.authorize('read', user)

    return user
})

router.patch('/:id', async ({ params, acl, body }) => {
    const payload = validator.validate(body, (v) => v.object({
        name: v.optional(v.string()),
        username: v.optional(v.string()),
        email: v.optional(v.pipe(v.string(), v.email())),
    }))

    const id = Number(params.id)

    const user = await User.findByIdOrFail(Number(params.id))

    acl.authorize('update', user)

    user.merge(payload)

    await user.save()

    return user
})

router.put('/:id/password', async ({ params, body }) => {
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

    const user = await userRepository.find(Number(params.id))
    
    if (!user) {
        throw new BaseException('User not found', 404)
    }

    await userRepository.update(Number(params.id), { password: payload.password })

    return { success: true, }
})

router.delete('/:id', async ({ params }) => {
    const user = await userRepository.softDelete(Number(params.id))

    if (!user) {
        throw new BaseException('User not found', 404)
    }

    return { message: 'User deleted successfully' }
})
