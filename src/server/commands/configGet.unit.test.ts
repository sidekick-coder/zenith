import path from 'path'
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import di from '#server/facades/di.facade.ts'
import ConfigService from '#shared/services/config.service.ts'
import ArteTesterService from '#server/services/arteTester.service.ts'

const arte = new ArteTesterService()

describe('command: config:get', () => {
    let logSpy: ReturnType<typeof vi.spyOn>
    let getSpy: ReturnType<typeof vi.fn>

    beforeAll(async () => {
        await arte.add(path.resolve(import.meta.dirname, './configGet.command.ts'))
    })

    beforeEach(() => {
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        getSpy = vi.fn((key: string) => {
            if (key === 'app.name') {
                return 'TestApp'
            }

            return null
        })

        di.set(ConfigService, { get: getSpy, })
    })

    afterEach(() => {
        logSpy.mockClear()
        getSpy.mockClear()
    })

    it('should call config.get"', async () => {
        await arte.execute(['config:get', 'app.name'])

        expect(getSpy).toHaveBeenCalledWith('app.name')
        expect(logSpy).toHaveBeenCalledWith('TestApp')
    })
})

