import db from '#facades/db.ts'
import router from '#facades/router.ts'
import authMiddleware, { AuthMiddleware } from '#router/middlewares/auth.middleware.ts'
import type { HttpContext } from '#router/types.ts'

router
    .middleware(authMiddleware)
    .get('/api/users', async (ctx) => {
        console.log(ctx.body)
        const users = await db.selectFrom('users').execute()

        return { users }
    })

router
    .middleware(authMiddleware)
    .get('/api/users/:id', async (ctx: HttpContext<[AuthMiddleware]>) => {
        console.log(ctx.user)
        const users = await db.selectFrom('users').execute()

        return { users }
    })
