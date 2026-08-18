import hasher from '#server/facades/hasher.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('hasher:compare')
    .helpGroup('hasher')
    .argument('<original>', 'Value to verify')
    .argument('<hash>', 'Hash to compare against')
    .action(async (original: string, hash: string) => {
        const isValid = await hasher.compare(original, hash)

        console.log(isValid)
    })
