# What is Zenith?

Zenith is a CMS that sits in the middle ground between something like **WordPress** and a full framework like **Laravel**. It gives you a ready-to-use dashboard and a structured application out of the box, while still being flexible enough to grow with your project.

## The idea

Most CMS tools give you a lot for free but lock you in. Full frameworks give you total freedom but require you to build everything yourself. Zenith tries to find the balance: you get a working system from day one, and you can extend or reshape it as your needs evolve.

## What you get out of the box

- **Setup UI** — on first run, a guided setup interface walks you through configuring the instance: database connection, admin account, and initial settings. No manual config files required.
- **Admin dashboard** — a built-in interface to manage your content without writing any frontend code. The dashboard is fully extensible, so modules can add their own pages and sections to it.
- **Authentication & permissions** — a complete auth system with granular permission controls. You can define permissions at any level of detail and assign them to roles or individual users, giving you fine-grained control over who can do what.
- **Modules** — extend any part of the system through modules: add routes, pages, components, or even change the database schema itself, all without touching the core.

## Modules

The real flexibility in Zenith comes from **modules**. A module is a self-contained piece of functionality that can do more than just add a route or a page — it can change the **database schema** itself.

This means you can ship a module that adds new tables, modifies existing ones, and brings its own UI, all without touching the core. It's the same idea behind WordPress plugins, but with the structure and type safety of a modern TypeScript stack.

## Who is it for?

Zenith is a good fit if you:

- Want a working CMS without building everything from scratch
- Need to customize the data model beyond what a typical CMS allows
- Prefer working in TypeScript with a clear project structure over fighting a black-box platform
