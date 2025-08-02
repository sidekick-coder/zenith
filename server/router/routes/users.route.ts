import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/router/middlewares/auth.middleware.ts'
import userRepository from '#server/repositories/user.repository.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/users')
    .group()

router.get('/', async (ctx) => {
    const page = ctx.query.page ? Number(ctx.query.page as string) : 1
    const limit = ctx.query.limit ? Number(ctx.query.limit as string) : 10

    return userRepository.paginate(page, limit)
})
