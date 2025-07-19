import db from "#facades/db.ts";
import router from "#facades/router.ts";

router.get('/api/tasks', async () => {
    const tasks = await db.selectFrom('tasks')
        .selectAll()
        .execute();

    return tasks;
})