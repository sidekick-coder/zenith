import { program } from 'commander'
import hasher from '#server/facades/hasher.facade.ts'

program.command('hasher:hash')
    .helpGroup('hasher')
    .argument('<value>', 'Value to hash')
    .action(async (value: string) => {
        const hashed = await hasher.hash(value)
        console.log(hashed)
    })