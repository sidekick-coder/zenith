import { hasher } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('hasher:hash')
    .helpGroup('hasher')
    .argument('<value>', 'Value to hash')
    .action(async (value: string) => {
        const hashed = await hasher.hash(value)

        console.log(hashed)
    })

export default command
