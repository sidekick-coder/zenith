import { exists } from './exists.ts'
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import hasher from '#server/facades/hasher.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import User from '#server/entities/user.entity.ts'

export interface UserPayload {
    name: string
    email: string
    username: string
    password: string
}

function userExists(email: string, username: string) {
    return exists('users', {
        query: q => q.selectAll()
            .where(eb => eb.or([
                eb('email', '=', email),
                eb('username', '=', username)
            ]))
    })
}

export async function createUser(payload: UserPayload) {

    if (await userExists(payload.email, payload.username)) {
        throw new BaseException('User with given email or username already exists', 400)
    }

    const userData = {
        name: payload.name,
        email: payload.email,
        username: payload.username,
        password: await hasher.hash(payload.password),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    }

    await emmitter.emitAndWait('user:before-create', { user: userData })

    const user = await  db.insertInto('users')
        .values(userData)
        .returningAll()
        .executeTakeFirst()

    if (!user) {
        throw new BaseException('Failed to create user', 500)
    }

    await emmitter.emitAndWait('user:after-create', { user })

    return User.from(user)
}