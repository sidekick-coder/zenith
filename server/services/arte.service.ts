import { Command } from 'commander'
import chalk from 'chalk'
import { table } from '../utils/index.ts'

export default class ArteService extends Command {
    public static __container_entry_key = 'ArteService'

    public needs: Set<string> = new Set()
    public table: typeof table = table
    public colors = chalk

    public need(...args: string[]): this {
        args.forEach(arg => this.needs.add(arg))

        return this
    }

    createCommand(name?: string) {
        return new ArteService(name)
    }

}
