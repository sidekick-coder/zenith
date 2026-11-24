import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import ZenithContainer from '../entities/ZenithContainer.ts'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'

describe('user roles routes', () => {
    let container: ZenithContainerStarted
    let authorization: string
    let userId: number
    let roleId: number

    async function request<T>(path: string, init?: RequestInit) {
        const response = await fetch(container.makeURL(path), init)
        const body = await response.json() as T

        return {
            body,
            status: response.status 
        }
    }

    beforeAll(async () => {
        container = await ZenithContainer.create().start()

        const login = await request<{ token: string, user: { id: number } }>('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uuid: 'admin',
                password: 'admin-123',
            }),
        })

        expect(login.status).toBe(200)
        authorization = `Bearer ${login.body.token}`
        userId = login.body.user.id

        const role = await request<{ id: number }>('/api/roles', {
            method: 'POST',
            headers: {
                Authorization: authorization,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'User roles integration test', }),
        })

        expect(role.status).toBe(200)

        const roles = await request<{ items: Array<{ id: number }> }>('/api/roles', { headers: { Authorization: authorization }, })

        expect(roles.status).toBe(200)
        roleId = roles.body.items.at(-1)!.id
    })

    afterAll(async () => {
        await container.stop()
    })

    it('requires authentication', async () => {
        const response = await request('/api/users/1/roles')

        expect(response.status).toBe(401)
    })

    it('lists, assigns, and removes roles for a user', async () => {
        const headers = {
            Authorization: authorization,
            'Content-Type': 'application/json',
        }
        const path = `/api/users/${userId}/roles`

        const initially = await request<{ items: Array<{ id: number }> }>(path, { headers })

        expect(initially.status).toBe(200)
        expect(initially.body.items).toEqual([])

        const assigned = await request<{ success: boolean }>(path, {
            method: 'POST',
            headers,
            body: JSON.stringify({ role_id: roleId }),
        })

        expect(assigned.status).toBe(200)
        expect(assigned.body).toEqual({ success: true })

        const listed = await request<{ items: Array<{ id: number }> }>(path, { headers })

        expect(listed.status).toBe(200)
        expect(listed.body.items).toHaveLength(1)
        expect(listed.body.items[0].id).toBe(roleId)

        const assignedAgain = await request<{ success: boolean }>(path, {
            method: 'POST',
            headers,
            body: JSON.stringify({ role_id: roleId }),
        })

        expect(assignedAgain.status).toBe(200)

        const afterDuplicateAssignment = await request<{ items: Array<{ id: number }> }>(path, { headers })

        expect(afterDuplicateAssignment.body.items).toHaveLength(1)

        const removed = await request<{ success: boolean }>(`${path}/${roleId}`, {
            method: 'DELETE',
            headers,
        })

        expect(removed.status).toBe(200)
        expect(removed.body).toEqual({ success: true })

        const afterRemoval = await request<{ items: Array<{ id: number }> }>(path, { headers })

        expect(afterRemoval.status).toBe(200)
        expect(afterRemoval.body.items).toEqual([])
    })
})
