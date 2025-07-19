import { Kysely } from 'kysely'

export async function run(db: Kysely<Database>): Promise<void> {
    await db.insertInto('tasks')
        .values([
            {
                title: 'Task 1',
                description: 'Description for Task 1',
                status: 'pending',
            },
            {
                title: 'Task 2',
                description: 'Description for Task 2',
                status: 'in-progress',
            },
            {
                title: 'Task 3',
                description: 'Description for Task 3',
                status: 'completed',
            },
        ])
        .execute()
}