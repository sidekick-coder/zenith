import router from '#facades/router.ts'
import authMiddleware from '#router/middlewares/auth.middleware.ts'
import userRepository from '#repositories/user.repository.ts'

router
    .middleware(authMiddleware)
    .get('/api/users', async (ctx) => {
        const page = ctx.query.page ? Number(ctx.query.page as string) : 1
        const limit = ctx.query.limit ? Number(ctx.query.limit as string) : 10

        return userRepository.paginate(page, limit)
    })