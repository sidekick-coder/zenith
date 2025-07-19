import { db } from "#database/db.ts";
import router from "#server/router";

router.get('/api/tasks', async () => {
    const tasks = await db.selectFrom('tasks')
        .selectAll()
        .execute();

    return tasks;
})