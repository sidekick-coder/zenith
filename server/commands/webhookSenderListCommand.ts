import { CliCommand } from '@sidekick-coder/zenith-kit/server'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'

const command = new CliCommand('webhook-sender:list')

command
    .helpGroup('webhooks')
    .action(async () => {
        const senders = await webhookSenderRepository.findMany()

        if (senders.length === 0) {
            console.log('No webhook senders found.')
            return
        }

        const items = senders.map(sender => ({
            id: sender.id,
            name: sender.name,
            trigger_events: sender.trigger_events.join(', '),
            enabled: sender.enabled ? command.colors.green('Yes') : command.colors.red('No'),
        }))

        command.table(items)
    })

export default command
