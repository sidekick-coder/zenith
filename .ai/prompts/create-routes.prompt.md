---
description: "Create CRUD route and validator files for a model entity following project conventions"
argument-hint: "entity name (PascalCase, e.g. Role, Permission, EmailTemplate) and optional route prefix"
---

# CRUD Route Generator

## Purpose
Generate a `server/routes/[entity].route.ts` and a `shared/validators/[entity].validator.ts` for a given entity by **reading the existing entity source files** to derive all required information automatically.

---

## Inputs

- **Entity** — PascalCase class name (e.g., `Role`, `Permission`)
- **Route prefix** *(optional)* — the URL prefix to use (e.g., `/api/roles`). If not provided, default to `/api/{tableName}`.

---

## Step 1 — Read the entity source files

Given the entity name (e.g., `Role`), read **both** files before writing anything:

1. **`server/entities/[camelCase].entity.ts`** — to extract:
   - The **table name**: first argument of `Model('tablename')` in the `composeWith` / `extends` call
   - Any server-side details or custom methods

2. **`shared/entities/[camelCase].entity.ts`** — to extract:
   - All **public fields** declared on the class (name + TypeScript type)
   - Whether **`SoftDelete`** mixin is composed in → determines if soft delete is used
   - Whether **`Timestamp`** mixin is composed in → timestamps are managed automatically, exclude from validator

Do **not** ask the user for table name, fields, ACL subject, or soft delete — derive all of this from the code.

---

## Step 2 — Derive generation parameters

From reading the entity files, determine:

| Parameter | How to derive |
|---|---|
| **Table name** | First arg of `Model('...')` in the server entity |
| **Route prefix** | Provided by user, or `/api/{tableName}` if not specified |
| **Fields for validator** | Public fields from the shared entity, excluding: `id`, `created_at`, `updated_at`, `deleted_at`, and any relational properties (arrays of other entities, optional loaded relations) |
| **Field optionality** | Fields typed as `?: ...` or `... \| null` or `... \| undefined` → `v.optional(...)` or `v.nullish(...)` |
| **TypeScript → valibot type mapping** | `string` → `v.string()`, `number` → `v.number()`, `boolean` → `v.boolean()`, `Date \| string` → `v.string()`, `string \| null` → `v.nullish(v.string())` |
| **Soft delete** | `SoftDelete` mixin present in shared entity → use `instance.softDelete()` on delete; absent → use `Entity.destroyById(id)` |
| **ACL subject string** | The PascalCase class name (e.g., `'Role'`) |

---

## Step 3 — Generate files

### Route file (`server/routes/[entity].route.ts`)

- Import order: exceptions → db/queries → router/middleware → entity → validator/schemas
- Always use `rootRouter.use(authMiddleware).prefix('/api/...').group()`
- Parse numeric IDs with `validator.validate(params.id, schemas.url.number())`
- Paginate with `schemas.pagination.schema` validated against `query`
- ACL checks per verb:
  - `GET /` → `acl.authorize('list', 'EntityName')` *(string, not instance)*
  - `GET /:id` → fetch first, then `acl.authorize('read', instance)`
  - `POST /` → `acl.authorize('create', 'EntityName')` *(string)*
  - `PATCH /:id` → fetch first, then `acl.authorize('update', instance)`
  - `DELETE /:id` → fetch first, then `acl.authorize('delete', instance)`
- `POST /` uses `db.insertInto(table).values(payload).returningAll().executeTakeFirst()` then `new Entity(row)`
- `PATCH /:id` uses `Entity.updateById(id, payload)` + `instance.merge(payload)`
- If soft delete: `instance.softDelete()` — if not: `Entity.destroyById(id)`
- List uses `Entity.paginate({ query: (qb) => qb.selectAll().where(undeleted), page, limit })`

### Validator file (`shared/validators/[entity].validator.ts`)

- Import only `validator from '#shared/services/validator.service.ts'`
- Define `const schema = validator.create(v => v.object({...}))` using fields derived from the shared entity
- Export `create = schema` and `update = validator.create(v => v.partial(schema))`
- Map optional/nullable fields to `v.optional(...)` / `v.nullish(...)`

### Update `shared/validators/index.ts`

- Add `import * as entityCamelCase from './entity.validator.ts'` in the imports block
- Add `entityCamelCase,` in the `schemas` object

---

## Output format

1. A one-line summary of what was read and what will be generated
2. **File: `server/routes/[entity].route.ts`** — full file contents
3. **File: `shared/validators/[entity].validator.ts`** — full file contents
4. **Patch: `shared/validators/index.ts`** — exact lines to add

---

## Example

### Input
```
Entity: Role
Route prefix: /api/roles
```

### Files read
- `server/entities/role.entity.ts` → `Model('roles')`, no custom soft-delete override
- `shared/entities/role.entity.ts` → fields: `id: number`, `name: string`, `description?: string`; mixins: `Timestamp`, `SoftDelete`

### Derived parameters
- Table: `roles` · Route prefix: `/api/roles` · ACL subject: `'Role'`
- Validator fields: `name: v.string()`, `description: v.nullish(v.string())`
- Soft delete: ✅ (uses `instance.softDelete()`)

### Output

**`server/routes/role.route.ts`**
```ts
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import { undeleted } from '#server/queries/index.ts'
import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import Role from '#server/entities/role.entity.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/roles')
    .group()

router.get('/', async ({ acl, query }) => {
    acl.authorize('list', 'Role')

    const { page, limit } = validator.validate(query, schemas.pagination.schema)

    return Role.paginate({
        query: (qb) => qb.selectAll().where(undeleted),
        page,
        limit,
    })
})

router.get('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.url.number())

    const role = await Role.findOrFail(id)

    acl.authorize('read', role)

    return role
})

router.post('/', async ({ body, acl }) => {
    acl.authorize('create', 'Role')

    const payload = validator.validate(body, schemas.role.create)

    const row = await db.insertInto('roles').values(payload)
        .returningAll()
        .executeTakeFirst()

    if (!row) {
        throw new BaseException('Failed to create role', 500)
    }

    return new Role(row)
})

router.patch('/:id', async ({ params, body, acl }) => {
    const id = validator.validate(params.id, schemas.url.number())

    const role = await Role.findOrFail(id)

    acl.authorize('update', role)

    const payload = validator.validate(body, schemas.role.update)

    await Role.updateById(id, payload)

    role.merge(payload)

    return role
})

router.delete('/:id', async ({ params, acl }) => {
    const id = validator.validate(params.id, schemas.url.number())

    const role = await Role.findOrFail(id)

    acl.authorize('delete', role)

    await role.softDelete()

    return role
})
```

**`shared/validators/role.validator.ts`**
```ts
import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    name: v.string(),
    description: v.nullish(v.string()),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))
```

**Patch `shared/validators/index.ts`**
```diff
+ import * as role from './role.validator.ts'

  const schemas = {
+     role,
      // ...
  }
```

---

## Notes

- Always fetch the entity instance **before** the ACL check on `read`, `update`, and `delete`.
- Always use a class string `'EntityName'` for `list` and `create` ACL checks — never an instance.
- Exclude `id`, `created_at`, `updated_at`, `deleted_at`, `password`, and loaded relation arrays from the validator schema.
- If a shared entity does not exist (entity is only server-side), read the fields directly from the server entity class.
- Prefer `schemas.url.number()` over the deprecated `schemas.query.number`.
