import { db } from "../database/index.ts"
import router from "../services/router.service.ts"

router.get('/users', async () => {
    const users = await db.selectFrom('users').execute();

    return users;
})
