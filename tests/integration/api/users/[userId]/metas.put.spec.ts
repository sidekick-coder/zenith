import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import UserMeta from '#server/entities/userMeta.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('PUT /api/users/[userId]/metas', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('creates a single user meta', async () => {
        const user = await createUser()

        const response = await api.create(
            api.request.put(`/api/users/${user.id}/metas`).send({
                name: 'timezone',
                value: 'UTC',
            })
        )

        expect(response.body).toMatchObject({
            name: 'timezone',
            value: 'UTC',
        })

        await expect(UserMeta.findOne({
            where: eb => eb.and({
                user_id: user.id,
                name: 'timezone',
            }),
        })).resolves.toMatchObject({ value: 'UTC' })
    })

    it('creates multiple user metas and updates an existing name', async () => {
        const user = await createUser()
        await UserMeta.create({
            user_id: user.id,
            name: 'timezone',
            value: 'UTC',
        })

        const response = await api.create(
            api.request.put(`/api/users/${user.id}/metas`).send([
                {
                    name: 'timezone',
                    value: 'America/Sao_Paulo',
                },
                {
                    name: 'language',
                    value: 'pt-BR',
                },
            ])
        )

        expect(response.body).toEqual([
            {
                name: 'timezone',
                value: 'America/Sao_Paulo',
            },
            {
                name: 'language',
                value: 'pt-BR',
            },
        ])

        const metas = await UserMeta.list({ where: eb => eb('user_id', '=', user.id), })

        expect(metas).toHaveLength(2)
        expect(metas).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'timezone',
                value: 'America/Sao_Paulo',
            }),
            expect.objectContaining({
                name: 'language',
                value: 'pt-BR',
            }),
        ]))
    })
})
