# Server Entities

Server entities live in `mymodule/server/entities/` and extend their [shared counterpart](/modules/shared/entities) with database bindings, query methods, lifecycle hooks, and relations. They are never imported by the client.

Use `composeWith` instead of `compose` — it accepts an existing class as its first argument:

```ts
// mymodule/server/entities/role.entity.ts
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#mymodule/shared/entities/role.entity.ts'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export default class Role extends composeWith(Base, Model('roles')) {}
```

## Model Mixin

`Model(table)` binds the entity to a database table and adds static query methods:

```ts
Model('mymodule_items')
Model('mymodule_items', 'id') // second argument sets the primary key (default: 'id')
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
const active = await Item.list({
    query: qb => qb.selectAll().where('status', '=', 'active')
})
```

You can also add custom static finders directly on the class:

```ts
export default class Item extends composeWith(Base, Model('mymodule_items')) {
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

export default class Item extends composeWith(Base, HooksStatic, Model('mymodule_items')) {
    public static async beforeSave(item: Partial<Item>) {
        if (item.slug) {
            item.slug = item.slug.toLowerCase()
        }
    }

    public static async afterCreate(item: Item) {
        emmitter.emit('mymodule_item:after-create', { item })
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

const ItemRelations = {
    metas: new HasMetas({
        table: 'mymodule_items',
        tableKey: 'id',
        targetTable: 'mymodule_item_metas',
        targetKey: 'item_id',
        property: 'metas',
    })
}

export default class Item extends composeWith(
    Base,
    Model('mymodule_items'),
    Relation(ItemRelations)
) {}
```

Load relations on a list of instances:

```ts
const items = await Item.list()
await Item.load(items, 'metas')
// or load multiple at once
await Item.load(items, ['metas', 'otherRelation'])
```

## Metadata Mixin

`Metadata(metasTable, foreignKey)` adds `get` and `set` helpers for key-value metadata stored in a related table:

```ts
import { Metadata } from '#server/mixins/metadata.mixin.ts'

export default class Item extends composeWith(
    Base,
    Model('mymodule_items'),
    Metadata('mymodule_item_metas', 'item_id')
) {}
```

```ts
const value = await item.get('theme', 'light')
await item.set('theme', 'dark')
```

> `Metadata` requires `Model` to be composed first.

## Serialization and toJSON

By default `Model` serializes database rows into entity instances. Override `toJSON()` to control what fields are exposed when the entity is sent as a JSON response:

```ts
public toJSON() {
    return {
        id: this.id,
        name: this.name,
        created_at: this.created_at,
        // omit sensitive or internal fields
    }
}
```

## Composing Multiple Mixins

Mixins are applied left to right. A typical full composition looks like this:

```ts
export default class Item extends composeWith(
    Base,               // shared entity
    HooksStatic,        // lifecycle hooks (before Model)
    Model('mymodule_items'), // database binding
    Metadata('mymodule_item_metas', 'item_id')
) {}
```
