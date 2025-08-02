import { Kysely } from 'kysely'

export async function run(db: Kysely<Database>): Promise<void> {
    console.log('Running sample seed...')
    
    // Example: Insert sample users
    await db.insertInto('users')
        .values([
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password456',
            },
        ])
        .execute()
        
    console.log('Sample users created')
}
