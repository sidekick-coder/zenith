#!/usr/bin/env node
import path from 'path'
import { ArtisanWrapperService, EnvService } from '@sidekick-coder/zenith-kit/server'

// eslint-disable-next-line no-undef
process.env['ZENITH_BASE_PATH'] = import.meta.dirname

EnvService
    .create()
    .addFile(path.join(import.meta.dirname, '.env'))
    .load()

ArtisanWrapperService
    .create()
    .setBasePath(import.meta.dirname)
    .run()
