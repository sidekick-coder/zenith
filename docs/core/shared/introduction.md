# Shared

The `shared/` directory contains code that can run on **both the client and the server**. Because it must work in either environment, shared code is restricted to native JavaScript — no Node.js built-ins, no browser globals, no environment-specific dependencies.

Think of the shared layer as a pure logic layer: data structures, validation schemas, utility functions, and base service classes that have no side effects tied to a specific runtime.

## What belongs here

- Base service classes (extended separately on client and server)
- Validation schemas (e.g. Valibot)
- Pure utility functions
- Shared TypeScript types and interfaces
- Serialization and transformation helpers

## What does not belong here

- `fs`, `path`, `crypto`, or any other Node.js built-in
- `window`, `document`, `localStorage`, or any browser API
- Direct imports from `server/` or `client/`
- Any library that has different behaviour depending on the runtime

## Why this separation matters

Keeping shared code free of runtime assumptions means the same logic can be used for server-side validation, client-side validation, and SSR without any conditional shims or bundler hacks.
