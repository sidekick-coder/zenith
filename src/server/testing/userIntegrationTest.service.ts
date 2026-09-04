import type { StartedTestContainer } from 'testcontainers'
import { UserEntity } from '@sidekick-coder/zenith-kit/shared'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import type Permission from '#shared/entities/permission.entity.ts'

export class TestUser extends UserEntity {
    public async addPermission(payload: Pick<Permission, 'name' | 'action' | 'subject'>) {
        const error = new Error('Method not implemented.')
        
        Object.assign(error, { payload })

        throw error
    }
}

export default class UserIntegrationTestService {
    private container: StartedTestContainer

    constructor(container: StartedTestContainer) {
        this.container = container
    }

    private async command(args: string[]) {
        const execResult = await this.container.exec(args)

        if (execResult.exitCode !== 0) {
            throw new Error(`Failed to execute command: ${execResult.output}`)
        }

        const [error, json] = tryCatch.sync(() => JSON.parse(execResult.output))

        if (error || !json) {
            return execResult.output
        }

        return json
    }

    public async create(payload: Pick<Required<UserEntity>, 'email' | 'password' | 'username'>) {
        const { email, password, username } = payload

        const args = ['node', 'arte', 'user:create']

        args.push('--email', email)
        args.push('--password', password)
        args.push('--username', username)
        args.push('--json')

        const json = await this.command(args)

        const user = TestUser.from(json)

        user.addPermission = async (p) => await this.addPermission(user.id, p)

        return user
    }

    public async addPermission(userId: number, payload: Pick<Permission, 'name' | 'action' | 'subject'>) {
        const permission = await this.command([
            'node',
            'arte',
            'permission:create',
            '--name',
            payload.name,
            '--action',
            payload.action,
            '--subject',
            payload.subject,
            '--json'
        ])

        await this.command([
            'node',
            'arte',
            'permission:attach',
            '--permissionId',
            permission.id.toString(),
            '--type',
            'user',
            '--id',
            userId.toString(),
        ])
    }
}
