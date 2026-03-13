# Client

The `client/` directory contains code that runs exclusively in the **browser**. This includes UI components, client-side routing, reactive state, and anything that interacts directly with the DOM or browser APIs.

Client code has access to browser globals (`window`, `document`, `localStorage`, etc.) and can import front-end libraries, but it must never reference Node.js built-ins or server-only modules.

## What belongs here

- Vue components and pages
- Client-side routes
- Browser event handling
- UI state management
- Calls to the server API via `$fetch`

## What does not belong here

- Database access
- File system operations
- Server environment variables
- Any Node.js-only module (`fs`, `path`, `crypto`, etc.)

## Facades

Client-side facades live in `client/facades/` and provide access to shared services scoped to the browser context. For example, `config.facade.ts` exposes a plain in-memory `ConfigService` instance that can be populated at runtime from API responses.
