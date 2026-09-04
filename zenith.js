#!/usr/bin/env node
import path from 'path'
import EnvService from '@sidekick-coder/zenith-kit/server/services/EnvService'
import CliWrapperService from '@sidekick-coder/zenith-kit/server/services/CliWrapperService'

// eslint-disable-next-line no-undef
process.env['ZENITH_BASE_PATH'] = import.meta.dirname

EnvService
    .create()
    .addFile(path.join(import.meta.dirname, '.env'))
    .load()

CliWrapperService
    .create()
    .setBasePath(import.meta.dirname)
    .addEnv('ZENITH_SERVER_WATCH_ENTRIES', 'server')
    .run()
