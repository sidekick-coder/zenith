import { hasher } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('hasher:compare')
    .helpGroup('hasher')
    .argument('<original>', 'Value to verify')
    .argument('<hash>', 'Hash to compare against')
    .action(async (original: string, hash: string) => {
        const isValid = await hasher.compare(original, hash)

        console.log(isValid)
    })

export default command
