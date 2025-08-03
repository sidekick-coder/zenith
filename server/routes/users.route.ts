import BaseException from '#server/exceptions/base.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import userRepository from '#server/repositories/user.repository.ts'
import validator from '#server/services/validator.service.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users')
    .group()

router.get('/', async (ctx) => {
    const page = ctx.query.page ? Number(ctx.query.page as string) : 1
    const limit = ctx.query.limit ? Number(ctx.query.limit as string) : 10

    return userRepository.paginate(page, limit)
})

router.post('/', async ({ body }) => {
    const payload = validator.validate(body, (v) => v.object({
        email: v.pipe(v.string(), v.email()),
        password: v.pipe(v.string(), v.minLength(6)),
        username: v.optional(v.string()),
        name: v.optional(v.string()),
    }))

    const exists = await userRepository.exists(payload.email)

    if (exists) {
        throw new BaseException('User already exists', 400)
    }

    const user = await userRepository.create({
        ...payload,
        username: payload.username || payload.email,
        name: payload.name || payload.email,
    })


    return user
})

router.get('/:id', async ({ params }) => {
    const user = await userRepository.find(Number(params.id))

    if (!user) {
        throw new BaseException('User not found', 404)
    }

    return user
})