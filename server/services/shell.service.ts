import { spawn } from 'child_process'
import rootLogger from '../facades/logger.facade.ts'

const logger = rootLogger.child({ label: 'shell' })

interface CommandOptions {
    cwd?: string
    silent?: boolean
    env?: NodeJS.ProcessEnv
}

export default class ShellService {
    /**
     * Execute a shell command and return a promise
     */
    public async command(command: string, args: string[], options: CommandOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: options.cwd || process.cwd(),
                stdio: options.silent ? 'pipe' : 'inherit',
                shell: true,
                env: options.env || process.env
            })

            child.on('close', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    const errorMessage = `Command failed with exit code ${code}`
                    logger.error(errorMessage, { 
                        command, 
                        args, 
                        code 
                    })
                    reject(new Error(errorMessage))
                }
            })

            child.on('error', (error) => {
                logger.error('Command execution error', { 
                    command, 
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
    public async executeCommandWithOutput(command: string, args: string[], options: CommandOptions = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: options.cwd || process.cwd(),
                stdio: 'pipe',
                shell: true,
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
                    logger.error(errorMessage, { 
                        command, 
                        args, 
                        code, 
                        errorOutput 
                    })
                    reject(new Error(errorMessage))
                }
            })

            child.on('error', (error) => {
                logger.error('Command execution error', { 
                    command, 
                    args, 
                    error: error.message 
                })
                reject(error)
            })
        })
    }
}
