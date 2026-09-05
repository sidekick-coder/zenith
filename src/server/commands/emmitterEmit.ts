import { emmitter } from '@sidekick-coder/zenith-kit/server'
import { flatten, validator } from '@sidekick-coder/zenith-kit/shared'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('emmitter:emit')

command
    .helpGroup('emmitter')
    .option('-e, --event <event>', 'Event to emit')
    .option('-p, --payload <payload>', 'payload in key=value format')
    .action(async (options) => {
        let event = options.event 
        let payload = {}

        if (!event) {
            event = await command.inquirer.input({ message: 'Event to emit', })
        }

        if (!event) {
            console.log('Event is required.')
            return
        }

        if (options.payload) {
            payload = validator.validate(options.payload, v => v.extras.keyValue())
        }

        await emmitter.emitAndWait(event, payload)

        command.object(flatten({
            event,
            payload,
        }))
    })

export default command
