import { spawn } from 'child_process'
import rootLogger from '../facades/logger.facade.ts'

const logger = rootLogger.child({ label: 'shell' })

interface CommandOptions {
    cwd?: string
    silent?: boolean
    env?: NodeJS.ProcessEnv
    shell?: boolean
}

export default class ShellService {
    public debug: boolean
    public logger: typeof logger

    constructor(data: Partial<ShellService> = {}) {
        this.debug = data.debug || false
        this.logger = data.logger || logger.child({ label: 'shell' })

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }
    /**
     * Execute a shell command and return a promise
     */
    public async command(bin: string, args: string[], options: CommandOptions = {}): Promise<void> {

        if (this.debug) {
            this.logger.debug('executing command', {
                bin,
                args,
                options,
            })
        }

        return new Promise((resolve, reject) => {
            const child = spawn(bin, args, {
                cwd: options.cwd || process.cwd(),
                stdio: options.silent ? 'pipe' : 'inherit',
                shell: options.shell ?? true,
                env: options.env || process.env
            })

            child.on('close', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    const errorMessage = `Command failed with exit code ${code}`
                    this.logger.error(errorMessage, { 
                        bin, 
                        args, 
                        code 
                    })
                    reject(new Error(errorMessage))
                }
            })

            child.on('error', (error) => {
                this.logger.error('Command execution error', { 
                    bin, 
                    args, 
                    error: error.message 
                })
                reject(error)
            })
        })
    }

    /**
     * Execute a shell command and return the output as a string
     */
    public async executeCommandWithOutput(bin: string, args: string[], options: CommandOptions = {}): Promise<string> {
        if (this.debug) {
            this.logger.debug('executing command', {
                bin,
                args,
                options,
            })
        }
        return new Promise((resolve, reject) => {
            const child = spawn(bin, args, {
                cwd: options.cwd || process.cwd(),
                stdio: 'pipe',
                shell: true,
                env: options.env || process.env
            })

            let output = ''
            let errorOutput = ''

            child.stdout?.on('data', (data) => {
                output += data.toString()
            })

            child.stderr?.on('data', (data) => {
                errorOutput += data.toString()
            })

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim())
                } else {
                    const errorMessage = `Command failed with exit code ${code}: ${errorOutput}`
                    this.logger.error(errorMessage, { 
                        bin, 
                        args, 
                        code, 
                        errorOutput 
                    })
                    reject(new Error(errorMessage))
                }
            })

            child.on('error', (error) => {
                this.logger.error('Command execution error', { 
                    bin, 
                    args, 
                    error: error.message 
                })
                reject(error)
            })
        })
    }
}
