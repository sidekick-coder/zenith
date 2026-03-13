# Server

The `server/` directory contains code that runs exclusively on the **server** (Node.js). This includes API routes, database access, file system operations, background jobs, and any logic that should never be exposed to the browser.

Server code can use Node.js built-ins, environment variables, and server-only libraries. It is never bundled into the client.

## What belongs here

- API route handlers
- Database queries and migrations
- File system and storage operations
- Server-side configuration
- Background jobs and scheduled tasks
- Authentication and authorization logic

## What does not belong here

- DOM manipulation or browser APIs
- Vue components or client-side routing
- Anything that depends on `window`, `document`, or `localStorage`

## Facades

Server-side facades live in `server/facades/` and provide access to services registered in the DI container. They resolve the correct instance at call time, so you always get the implementation that was registered during the server startup lifecycle.
