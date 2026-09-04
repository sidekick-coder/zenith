import { faker } from '@faker-js/faker'
import { userRepository } from '@sidekick-coder/zenith-kit/server'

export function makeUser(data: any = {}) {
    const payload: any = {
        name: faker.person.fullName(),
        username: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        verified_at: faker.date.past().toISOString(),
        ...data,
    }

    return payload
}

export async function createUser(data: any = {}) {
    const payload = makeUser(data)

    const user = await userRepository.create(payload)

    return user
}

