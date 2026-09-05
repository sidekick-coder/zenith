import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import hasher from '#server/facades/hasher.facade.ts'

const command = new CliCommand('hasher:hash')
    .helpGroup('hasher')
    .argument('<value>', 'Value to hash')
    .action(async (value: string) => {
        const hashed = await hasher.hash(value)
        console.log(hashed)
    })

export default command
