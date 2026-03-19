---
description: "Create CRUD route and validator files for a module entity following project conventions"
argument-hint: "module name and entity name (e.g. zenith-blocks Product)"
---

# Module CRUD Route Generator

## Purpose
Generate a `modules/[module]/server/routes/[entity].route.ts` and a `modules/[module]/shared/validators/[entity].validator.ts` for a given module entity by **reading the existing source files** to derive all required information automatically.

---

## Inputs

- **Module** — the folder name under `modules/` (e.g., `zenith-blocks`)
- **Entity** — PascalCase class name (e.g., `Product`, `Element`)
- **Route prefix** *(optional)* — the URL prefix to use (e.g., `/api/zblocks__elements`). If not provided, default to `/api/{tableName}`.

---

## Step 1 — Read the module package.json

Read **`modules/[module]/package.json`** and extract the module's import alias from the `imports` field.

The alias is the key that maps to `./server/*` — for example:
```json
"#zblocks/server/*": "./server/*"
```
→ alias prefix is `#zblocks`

This alias will be used for all module-internal imports (entities, validators).

---

## Step 2 — Read the entity source files

1. **`modules/[module]/server/entities/[camelCase].entity.ts`** — extract:
   - The **table name**: first argument of `Model('tablename')` in the `composeWith` / `extends` call

2. **`modules/[module]/shared/entities/[camelCase].entity.ts`** — extract:
   - All **public fields** declared on the class (name + TypeScript type)
   - Whether **`SoftDelete`** mixin is composed → determines soft delete behavior
   - Whether **`Timestamp`** mixin is composed → exclude `created_at`, `updated_at` from validator

Do **not** ask the user for table name, fields, ACL subject, or soft delete — derive all of this from the code.

---

## Step 3 — Derive generation parameters

| Parameter | How to derive |
|---|---|
| **Table name** | First arg of `Model('...')` in the server entity |
| **Route prefix** | Provided by user, or `/api/{tableName}` if not specified |
| **Module alias** | From `package.json` imports (e.g., `#zblocks`) |
| **Fields for validator** | Public fields from the shared entity, excluding: `id`, `created_at`, `updated_at`, `deleted_at`, and loaded relation properties (arrays of other entities) |
| **Field optionality** | Fields typed `?: ...` or `... \| null` → `v.optional(...)` or `v.nullish(...)` |
| **TypeScript → valibot mapping** | `string` → `v.string()`, `number` → `v.number()`, `boolean` → `v.boolean()`, `Date \| string` → `v.string()`, `string \| null` → `v.nullish(v.string())` |
| **Soft delete** | `SoftDelete` mixin in shared entity → `instance.softDelete()`; absent → `Entity.destroyById(id)` |
| **ACL subject string** | PascalCase entity class name (e.g., `'Product'`) |

---

## Step 4 — Check for existing validator index

Check if **`modules/[module]/shared/validators/index.ts`** exists:
- If it **exists**: add the new import and entry to the existing `schemas` object
- If it **does not exist**: create it from scratch with only the new validator entry

---

## Step 5 — Generate files

### Route file (`modules/[module]/server/routes/[entity].route.ts`)

Import rules:
- Core infrastructure (exceptions, db, queries, router, middleware) → use `#server/*`
- Module entity → use `[moduleAlias]/server/entities/[entity].entity.ts`
- Validator schemas → use `[moduleAlias]/shared/validators/index.ts`
- Validator service → use `#shared/services/validator.service.ts`
- Shared schemas (pagination, url) → use `#shared/validators/index.ts` aliased as `coreSchemas`

Router setup:
```ts
const router = rootRouter.use(authMiddleware)
    .prefix('/api/...')
    .group()
```

ACL checks per verb:
- `GET /` → `acl.authorize('list', 'EntityName')` *(string)*
- `GET /:id` → fetch first, then `acl.authorize('read', instance)`
- `POST /` → `acl.authorize('create', 'EntityName')` *(string)*
- `PATCH /:id` → fetch first, then `acl.authorize('update', instance)`
- `DELETE /:id` → fetch first, then `acl.authorize('delete', instance)`

Other patterns:
- Parse numeric IDs with `validator.validate(params.id, coreSchemas.url.number())`
- Pagination via `coreSchemas.pagination.schema` validated against `query`
- List uses `Entity.paginate({ query: (qb) => qb.selectAll().where(undeleted), page, limit })`
- Create uses `db.insertInto(table).values(payload).returningAll().executeTakeFirst()` then `new Entity(row)`
- Update uses `Entity.updateById(id, payload)` + `instance.merge(payload)`
- Soft delete: `instance.softDelete()` — hard delete: `Entity.destroyById(id)`

### Validator file (`modules/[module]/shared/validators/[entity].validator.ts`)

```ts
import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    // fields derived from shared entity
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))
```

### Validator index (`modules/[module]/shared/validators/index.ts`)

If creating from scratch:
```ts
import * as entityCamelCase from './entity.validator.ts'

const schemas = {
    entityCamelCase,
}

export default schemas
```

If updating existing: add the import line and the entry to the `schemas` object.

---

## Output format

1. A one-line summary of what was read and what will be generated
2. **File: `modules/[module]/server/routes/[entity].route.ts`** — full file contents
3. **File: `modules/[module]/shared/validators/[entity].validator.ts`** — full file contents
4. **File/Patch: `modules/[module]/shared/validators/index.ts`** — full file (if new) or exact diff (if updating)

---

## Example

### Input
```
Module: zenith-blocks
Entity: Element
Route prefix: /api/zblocks/elements
```

### Files read
- `modules/zenith-blocks/package.json` → alias: `#zblocks`
- `modules/zenith-blocks/server/entities/element.entity.ts` → `Model('zblocks__elements')`
- `modules/zenith-blocks/shared/entities/element.entity.ts` → fields: `id: number`, `name: string`, `description?: string | null`; mixins: `Timestamp`, `SoftDelete`

### Derived parameters
- Table: `zblocks__elements` · Route prefix: `/api/zblocks/elements` · ACL subject: `'Element'`
- Validator fields: `name: v.string()`, `description: v.nullish(v.string())`
- Soft delete: ✅

### Output

**`modules/zenith-blocks/server/routes/element.route.ts`**
```ts
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import { undeleted } from '#server/queries/index.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Element from '#zblocks/server/entities/element.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#zblocks/shared/validators/index.ts'
import coreSchemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/zblocks/elements')
    .group()

router.get('/', async ({ acl, query }) => {
    acl.authorize('list', 'Element')

    const { page, limit } = validator.validate(query, coreSchemas.pagination.schema)

    return Element.paginate({
        query: (qb) => qb.selectAll().where(undeleted),
        page,
        limit,
    })
})

router.get('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, coreSchemas.url.number())

    const element = await Element.findOrFail(id)

    acl.authorize('read', element)

    return element
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Element')

    const payload = validator.validate(body, schemas.element.create)

    const row = await db.insertInto('zblocks__elements').values(payload)
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to create element', 500)
    }

    return new Element(row)
})

router.patch('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, coreSchemas.url.number())

    const element = await Element.findOrFail(id)

    acl.authorize('update', element)

    const payload = validator.validate(body, schemas.element.update)

    await Element.updateById(id, payload)

    element.merge(payload)

    return element
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, coreSchemas.url.number())

    const element = await Element.findOrFail(id)

    acl.authorize('delete', element)

    await element.softDelete()

    return element
})
```

**`modules/zenith-blocks/shared/validators/element.validator.ts`**
```ts
import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    name: v.string(),
    description: v.nullish(v.string()),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))
```

**`modules/zenith-blocks/shared/validators/index.ts`** *(new file)*
```ts
import * as element from './element.validator.ts'

const schemas = {
    element,
}

export default schemas
```

---

## Notes

- Core infrastructure imports (`#server/*`, `#shared/*`) never change — they always point to the host app.
- Module-internal imports (entities, validators) always use the module alias derived from `package.json`.
- Always fetch the entity instance **before** the ACL check on `read`, `update`, and `delete`.
- Always use a class string for `list` and `create` ACL checks — never an instance.
- Exclude `id`, `created_at`, `updated_at`, `deleted_at`, and loaded relation arrays from the validator schema.
- If a shared entity file does not exist, read fields directly from the server entity class.