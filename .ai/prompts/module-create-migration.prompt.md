---
description: "Create a new migration for a module following project conventions in server/migrations/"
argument-hint: "module name and table details"
---

Migration Generator Prompt

Purpose
- Assist a developer or AI to generate a migration for a module using the project's Kysely TypeScript migration format, interactively collecting columns and options, and update the module's `server/contracts/database.contract.ts` accordingly.

Inputs (ask the user)
- Module name (e.g., `wallet`, `users`)
- Table name (defaults to pluralized module name with module prefix, see naming convention below)
- Columns: a newline-separated list with format `name:type[:options]` (e.g., `email:text:unique`, `amount:decimal:precision=10,scale=2`, `is_active:boolean:default=true`)
- Primary key preference (default `id` as `Generated<number>` / `bigserial` semantics)
- Include timestamps? (`yes`/`no`) — if yes, create `addTimestampColumns()` in the Kysely migration scaffold
- Include soft delete? (`yes`/`no`) — if yes, include `addSoftDeleteColumn()` in the scaffold
- Additional indexes or constraints (optional)

Behavior (what the prompt must do)
1. Validate inputs and ask follow-ups for ambiguous column types or options.
2. Produce a Kysely TypeScript migration scaffold matching this repo's convention (see example in docs) and ready to be saved under `modules/{module}/server/migrations/` with a suggested timestamped filename.
3. Produce an update (patch) for the module's `server/contracts/database.contract.ts` where relevant types/interfaces/exports are declared. Show the exact code snippet to add or replace and the target file path.
4. If requested, include a quick verification SQL or Kysely snippet to confirm the table structure.
5. Always show a concise summary of files to create/change and exact content for each file.

Output format
- A short human-readable summary (1-2 lines)
- Files to create/modify list with paths
- For each file: show the exact contents and filename
- A unified patch for `server/contracts/database.contract.ts` showing the minimal change required
- Example invocation at the end

Example input (interactive)
- Module: wallet
- Table: wallet__wallets
- Columns:
  - user_id:bigint:index
  - balance:decimal:precision=20,scale=8,default=0
  - currency:text:default='USD'
- Primary key: id:bigserial
- Include timestamps: yes
- Include soft delete: no

Example outputs (summarized)
- Migration file: `server/migrations/2026_03_14_create_wallets_table.sql` with full CREATE TABLE SQL
- Patch to `server/contracts/database.contract.ts` adding `WalletsTable` type or updating `DatabaseContract` interface
- Verification SQL: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='wallets';`

Clarifying questions to ask the user when ambiguous
- Do you want the migration scaffold created now in `modules/{module}/server/migrations/`? (default: yes)
- Should indexes be inline in the same migration or added as separate migrations?
- Naming convention: tables must be prefixed with the module alias and `__` (e.g., `mymodule__items`).

Notes for implementer
- Follow the project's Kysely TS helpers: prefer using `addIdColumn()`, `addColumn()`, `addTimestampColumns()`, `addSoftDeleteColumn()` as shown in the docs `docs/modules/server/migrations.md`.
- Soft delete should be a nullable timestamp `deleted_at` via `addSoftDeleteColumn()`.
- Migrations are always saved under `modules/{module}/server/migrations/` and tables must be named with the `module__` prefix to avoid collisions.

Example invocations (for an AI using this prompt)
- "Create migration for module `wallet` with columns X, include timestamps and soft delete, use postgres and update `server/contracts/database.contract.ts`."
- "Generate a TypeScript (knex) migration for `users` with timestamps only and add exports to the database contract."

What this prompt updates
- The migration file(s) for the module (saved under `modules/{module}/server/migrations/`)
- The module's `server/contracts/database.contract.ts` (update types/exports as a minimal patch)

After generation
- Provide exact files and content so the developer can `git apply` or paste them.
- Ask whether to create the files directly in the repo and whether to commit them.

End of prompt template.
