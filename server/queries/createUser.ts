import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import hasher from '#server/facades/hasher.facade.ts'

export interface UserPayload {
    email: string
    username: string
    name: string
    password: string
}

export async function createUser(payload: UserPayload) {
    const userData = {
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        password: await hasher.hash(payload.password)
    }

    const user = await  db.insertInto('users')
        .values(userData)
        .returningAll()
        .executeTakeFirst()

    if (!user) {
        throw new BaseException('Failed to create user', 500)
    }

    return user
}