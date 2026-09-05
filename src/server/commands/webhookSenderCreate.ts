import { validator } from '@sidekick-coder/zenith-kit/shared'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import { webhookSenderCreateSchema } from '#shared/schemas/webhookSenderSchema.ts'
import webhookSenderRepository from '#server/facades/webhookSenderRepository.ts'

const command = new CliCommand('webhook-sender:create')

command
    .helpGroup('webhooks')
    .option('-n, --name <name>', 'Name of the webhook sender')
    .option('-u, --url <url>', 'Webhook URL to send the payload to')
    .option('-e, --events <events...>', 'Events that trigger the webhook sender')
    .action(async (options) => {

        const payload = {
            name: options.name,
            request_url: options.url,
            trigger_events: options.events,
        }

        if (!payload.name) {
            payload.name = await command.inquirer.input({ message: 'Enter a name for the webhook sender', })
        }

        if (!payload.request_url) {
            payload.request_url = await command.inquirer.input({ message: 'Enter the webhook URL to send the payload to', })
        }

        if (!payload.trigger_events || payload.trigger_events.length === 0) {
            const eventsInput = await command.inquirer.input({ message: 'Enter the events that trigger the webhook sender (semicolon separated)', })

            payload.trigger_events = eventsInput.split(';').map((e: string) => e.trim())
        }

        const validated = validator.validate(payload, webhookSenderCreateSchema)

        const sender = await webhookSenderRepository.create(validated)

        command.object(sender)

    })

export default command
