import { program } from 'commander'
import hasher from '#server/facades/hasher.facade.ts'

program.command('hasher:compare')
    .helpGroup('hasher')
    .argument('<original>', 'Value to verify')
    .argument('<hash>', 'Hash to compare against')
    .action(async (original: string, hash: string) => {
        const isValid = await hasher.compare(original, hash)

        console.log(isValid)
    })