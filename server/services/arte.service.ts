import { Command } from 'commander'

export default class ArteService extends Command {
    public needs: Set<string> = new Set()

    public need(args: string): this {
        this.needs.add(args)

        return this
    }

    createCommand(name?: string) {
        return new ArteService(name)
    }
}
