# Express Vue SSR (TypeScript)

A full-featured Vue.js Server-Side Rendering (SSR) application built with TypeScript, Express.js, and Vite.

## Features

- 🚀 Vue 3 with Server-Side Rendering
- ⚡ Vite for fast development and building
- 🛠️ Express.js backend with modular architecture
- 📝 Structured logging with Winston
- ⏰ Scheduled tasks with node-schedule
- 🔄 Auto-reload development server
- 📁 Organized project structure with routes, commands, and services
- 🎯 Production-ready configuration
- 🔷 Full TypeScript support with type safety

## Tech Stack

- **Vue 3.5.17** - Progressive JavaScript framework
- **Express 5.1.0** - Fast, unopinionated web framework
- **Vite 7.0.3** - Next generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **Winston** - Structured logging
- **Node Schedule** - Cron-like job scheduler
- **Commander.js** - CLI framework

## Project Structure

```
├── client/                 # Vue.js frontend
│   ├── App.vue            # Main Vue component
│   ├── entry-client.ts    # Client-side entry point
│   ├── entry-server.ts    # Server-side entry point
│   ├── index.html         # HTML template
│   ├── main.ts            # Vue application setup
│   ├── style.css          # Global styles
│   ├── vite-env.d.ts      # Vite environment types
│   ├── components/        # Vue components
│   │   └── HelloWorld.vue
│   ├── assets/           # Static assets
│   │   └── vue.svg
│   └── public/           # Public assets
│       └── vite.svg
├── commands/              # CLI commands
│   ├── hello.ts          # Sample command
│   └── serve.ts          # Development server command
├── routes/               # Express routes
│   └── users.ts          # Sample route
├── routines/             # Scheduled tasks
│   └── sample.ts         # Sample routine
├── services/             # Application services
│   └── vite.ts           # Vite SSR service
├── utils/                # Utility functions
│   ├── importAll.ts      # Dynamic module loader
│   └── paths.ts          # Path utilities
├── bin/                  # Binary files
│   └── cli.js            # CLI binary
├── logs/                 # Application logs
│   ├── app.log
│   └── error.log
├── index.ts              # Main server file
├── logger.ts             # Logging configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App-specific TypeScript config
├── tsconfig.node.json    # Node-specific TypeScript config
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

The application will start with hot-reload enabled, watching for changes in your source files.

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Run server:
   ```bash
   node index.ts
   ```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build vite assets for production

## CLI Commands

The template includes a custom CLI tool called `art`:

```bash
# Start development server with watch mode
node art serve -w

# View available commands
node art --help

# Run a sample hello command
node art hello
```

### Creating Custom Commands

Add new commands in the `commands/` directory:

```typescript
// commands/migrate.ts
import { program } from 'commander'

program.command('migrate')
  .description('Run database migrations')
  .action(() => {
    console.log('Running migrations...')
  })
```

## Server-Side Rendering

This template implements full Vue 3 SSR with:

- **Server-side rendering** for initial page load
- **Client-side hydration** for interactive functionality
- **SEO-friendly** HTML output
- **Fast page transitions** after hydration

### How it works

1. **Server renders** the Vue app to HTML string
2. **Client receives** the pre-rendered HTML
3. **Vue hydrates** the static HTML into a dynamic app
4. **Subsequent navigation** is handled client-side

## Modular Architecture

### Routes
Express routes are automatically loaded from the `routes/` directory. Each route file should export a `router`:

```typescript
// routes/api.ts
import { Router } from 'express'

export const router = Router()

router.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
```

### Scheduled Tasks
Create background jobs in the `routines/` directory. Each routine should export a default object with `name`, `cron`, and `execute` properties:

```typescript
// routines/cleanup.ts
export default {
    name: 'Daily Cleanup',
    cron: '0 0 * * *', // Run every day at midnight
    execute: async () => {
        logger.info('Running daily cleanup at: ' + new Date().toISOString());
        // Your cleanup logic here
    }
}
```

## TypeScript Configuration

The project includes three TypeScript configuration files:

- **`tsconfig.json`** - Base TypeScript configuration
- **`tsconfig.app.json`** - Configuration for application code
- **`tsconfig.node.json`** - Configuration for Node.js specific code

TypeScript files are executed directly by Node.js without compilation - only Vite assets are built for production.

## Development Features

- **Hot Module Replacement (HMR)** with Vite
- **Auto-restart** on server file changes
- **Structured logging** for debugging
- **File watching** with intelligent ignore patterns
- **Error handling** with proper stack traces
- **Full TypeScript support** with type checking

## Production Features

- **Optimized build process** with Vite
- **Proper error handling** and logging
- **Environment-based configuration**
- **Performance optimizations**
- **Static asset handling**
- **Type safety** throughout the application

## Logging

The application uses Winston for structured logging:

- **Development**: Console output with colors
- **Production**: File-based logging in `logs/` directory
- **Log levels**: error, warn, info, debug
- **Automatic log rotation** (configurable)

## License

This template is provided as-is for development and learning purposes.
