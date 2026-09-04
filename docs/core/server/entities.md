# Server Entities

Server entities live in `server/entities/` and extend their [shared counterpart](/modules/shared/entities) with database bindings, query methods, lifecycle hooks, and relations. They are never imported by the client.

Use `composeWith` instead of `compose` — it accepts an existing class as its first argument:

```ts
// server/entities/role.entity.ts
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/role.entity.ts'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export default class Role extends composeWith(Base, Model('roles')) {}
```

## Model Mixin

`Model(table)` binds the entity to a database table and adds static query methods:

```ts
Model('users')
Model('roles', 'id') // second argument sets the primary key (default: 'id')
```

### Query Methods

| Method | Description |
|---|---|
| `Entity.list(options?)` | Returns an array of instances. |
| `Entity.paginate(options?)` | Returns a `Pagination<T>` with `items`, `total`, `page`, `per_page`, `total_pages`. |
| `Entity.findOne(options?)` | Returns the first matching instance or `null`. |
| `Entity.create(values)` | Inserts a row and returns the created instance. |
| `Entity.updateById(id, values)` | Updates a row by primary key. |
| `Entity.destroy(options)` | Deletes rows matching the given conditions. |
| `Entity.exists(options?)` | Returns `true` if at least one row matches. |
| `Entity.count(options?)` | Returns the number of matching rows. |

All methods accept a `query` callback that receives a Kysely query builder:

```ts
const admins = await User.list({
    query: qb => qb.selectAll().where('role', '=', 'admin')
})
```

You can also add custom static finders directly on the class:

```ts
export default class Role extends composeWith(Base, Model('roles')) {
    public static async findByName(name: string) {
        return this.findOne({
            query: qb => qb.where('name', '=', name)
        })
    }
}
```

## HooksStatic Mixin

`HooksStatic` enables lifecycle hooks: `beforeCreate`, `beforeUpdate`, `afterCreate`, `afterUpdate`, `serialized`, and others.

Register listeners inside a static `boot()` method. The mixin calls `boot()` automatically when the first instance is created:

```ts
import { HooksStatic } from '#server/mixins/hooks.mixin.ts'

export default class User extends composeWith(Base, HooksStatic, Model('users')) {
    public static async beforeSave(user: Partial<User>) {
        if (user.password) {
            user.password = await hasher.hash(user.password)
        }
    }

    public static async afterCreate(user: User) {
        emmitter.emit('user:after-create', { user })
    }

    public static boot() {
        this.on('beforeCreate', this.beforeSave)
        this.on('beforeUpdate', this.beforeSave)
        this.on('afterCreate', this.afterCreate)
    }
}
```

> `HooksStatic` must be composed **before** `Model` so the hooks are registered before the query methods run.

## Relation Mixin

`Relation(map)` adds a static `load()` method that eagerly loads named relations onto a list of entities.

Define relation objects in a map and pass it to the mixin:

```ts
import { Relation } from '#server/mixins/relations.mixin.ts'
import HasMetas from '#server/relations/hasMetas.relation.ts'

const FileRelations = {
    metas: new HasMetas({
        table: 'files',
        tableKey: 'id',
        targetTable: 'file_metas',
        targetKey: 'file_id',
        property: 'metas',
    })
}

export default class File extends composeWith(
    Base,
    Model('files'),
    Relation(FileRelations)
) {}
```

Load relations on a list of instances:

```ts
const files = await File.list()
await File.load(files, 'metas')
// or load multiple at once
await File.load(files, ['metas', 'otherRelation'])
```

## Metadata Mixin

`Metadata(metasTable, foreignKey)` adds `get` and `set` helpers for key-value metadata stored in a related table:

```ts
import { Metadata } from '#server/mixins/metadata.mixin.ts'

export default class User extends composeWith(
    Base,
    Model('users'),
    Metadata('user_metas', 'user_id')
) {}
```

```ts
const value = await user.get('theme', 'light')
await user.set('theme', 'dark')
```

> `Metadata` requires `Model` to be composed first.

## Serialization and toJSON

By default `Model` serializes database rows into entity instances. Override `toJSON()` to control what fields are exposed when the entity is sent as a JSON response:

```ts
public toJSON() {
    return {
        id: this.id,
        name: this.name,
        email: this.email,
        created_at: this.created_at,
        // omit password and other sensitive fields
    }
}
```

## Composing Multiple Mixins

Mixins are applied left to right. A typical full composition looks like this:

```ts
export default class User extends composeWith(
    BaseUser,       // shared entity
    HooksStatic,    // lifecycle hooks (before Model)
    Model('users'), // database binding
    Metadata('user_metas', 'user_id')
) {}
```
