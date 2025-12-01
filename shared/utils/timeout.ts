export function withTimeout<T>(promise: Promise<T> | (() => Promise<T>), ms: number): Promise<T> {
    const fn = typeof promise === 'function' ? promise : () => promise
    return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Process timeout')), ms)

        fn()
            .then(v => {
                clearTimeout(t)
                resolve(v)
            })
            .catch(err => {
                clearTimeout(t)
                reject(err)
            })
    })
}
import { spawn } from 'node:child_process'

export function execWithTimeout(cmd: string, args: string[], timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args)

        let stdout = ''
        let stderr = ''
        let finished = false

        const timeout = setTimeout(() => {
            if (!finished) {
                finished = true
                child.kill('SIGKILL') // 🔥 Kill GPG
                reject(new Error('Process timeout'))
            }
        }, timeoutMs)

        child.stdout.on('data', d => (stdout += d))
        child.stderr.on('data', d => (stderr += d))

        child.on('close', code => {
            if (finished) return
            finished = true
            clearTimeout(timeout)

            if (code === 0) resolve(stdout.trim())
            else reject(new Error(stderr.trim() || `Exit code ${code}`))
        })

        child.on('error', err => {
            if (finished) return
            finished = true
            clearTimeout(timeout)
            reject(err)
        })
    })
}
