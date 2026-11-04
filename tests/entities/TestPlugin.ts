import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import cp from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { load } from 'js-yaml'

export default class TestPlugin {
    public id: string
    public source: string
    public directory: string
    public config: Record<string, any> = {}

    constructor(name: string = 'basic') {
        this.id = ''
        this.source = path.resolve(import.meta.dirname, '..', 'fixtures', 'plugins', name)
        this.directory = path.join(os.tmpdir(), 'zenith', `plugin-test-${name}-${randomUUID()}`)
    }

    public static create(name?: string) {
        return new TestPlugin(name)
    }

    public async load() {
        fs.mkdirSync(this.directory, { recursive: true })
        fs.cpSync(this.source, this.directory, { recursive: true })

        // start git
        cp.execSync('git init', { cwd: this.directory })
        cp.execSync('git add .', { cwd: this.directory })
        cp.execSync('git commit -m "Initial commit"', { cwd: this.directory })

        // load zenith.config.yml
        const yaml = load(fs.readFileSync(path.join(this.directory, 'zenith.config.yml'), 'utf8'))

        this.config = yaml as Record<string, any>
        this.id = this.config.id

        // build plugin
        cp.execSync('npm install', { cwd: this.directory })
        cp.execSync('npm run build', { cwd: this.directory })
    }

    public async clean() {
        fs.rmSync(this.directory, {
            recursive: true,
            force: true
        })
    }

}
