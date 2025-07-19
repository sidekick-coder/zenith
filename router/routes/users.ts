import db from "#facades/db.ts"
import router from "#facades/router.ts"

router.get('/users', async () => {
    const users = await db.selectFrom('users').execute()

    return { users }
})
