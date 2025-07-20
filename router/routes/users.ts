import db from '#facades/db.ts'
import router from '#facades/router.ts'
import authMiddleware from '#router/middlewares/auth.middleware.ts'

router
    .middleware(authMiddleware)
    .get('/users', async (ctx) => {
        console.log(ctx)
        const users = await db.selectFrom('users').execute()

        return { users }
    })
