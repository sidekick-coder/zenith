import fs from 'fs'
import { defineConfig, globalLogger as logger } from 'tsdown'

export default defineConfig([
    {
        entry: [
            'src/server/cli.ts',
            'src/server/server.ts',

            'src/server/commands/*',
            '!src/server/commands/*.test.ts',

            'src/server/jobs/*',

            'src/server/routes/*',
            '!src/server/routes/*.test.ts',

            'src/server/api/**/*',
            'src/server/hooks/*',
            'src/server/routines/*',
        ],
        outDir: 'dist/server',
        minify: false,
        unbundle: true,
        sourcemap: 'inline',
        tsconfig: 'tsconfig.server.json',
        deps: {
            neverBundle: [
                'express',
                'kysely',
                'chalk',
                'commander',
                '@unhead/vue',
                'vite',
                'tsdown',
                '@vitejs/plugin-vue',
                '@tailwindcss/vite',
                '@sidekick-coder/zenith-kit',
            ]
        },
        hooks(hooks) {
            // copy resources to dist/server/resources
            hooks.hook('build:done', async () => {
                fs.cpSync('src/server/resources', 'dist/server/resources', { recursive: true })

                logger.info('resources copied to dist/server/resources')
            })
        }
    },
])
