import hasher from '#server/facades/hasher.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('hasher:hash')
    .helpGroup('hasher')
    .argument('<value>', 'Value to hash')
    .action(async (value: string) => {
        const hashed = await hasher.hash(value)
        console.log(hashed)
    })
