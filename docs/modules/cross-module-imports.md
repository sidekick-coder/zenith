# Cross-Module Imports

Modules can share components, composables, and utilities with each other. Because each module is compiled into an isolated bundle, sharing works through the same `globalThis.imports` / `globalThis.importAsync` API the host uses for framework packages.

There are two sides to the contract:

| Role | Responsibility |
|------|---------------|
| **Source module** (provides) | Registers its exports on `globalThis.imports` during `onRegister()` |
| **Target module** (consumes) | Declares the source module's alias in `module.json` `build.imports` |

---

## Source module — registering exports

In `client/module.client.ts`, register whatever you want to expose during the `onRegister()` lifecycle hook. Pick a short, unique alias for your module (e.g. `#zpayments`) and use it as the key prefix.

### Exposing Vue components

```ts
// modules/zenith-payments/client/module.client.ts
export default class ZenithPayments extends Module {
    public async onRegister(): Promise<void> {
        for (const [path, importFn] of Object.entries(import.meta.glob<any>('./{components,layouts}/**/*.vue'))) {
            const id = path.replace('./', '#zpayments/')
            const ext = path.split('.').pop()

            globalThis.imports[id] = importFn
            globalThis.imports[id.replace(`.${ext}`, '')] = importFn
        }
    }
}
```

This registers every `.vue` file under `components/` and `layouts/` under two ids:

```
#zpayments/components/UserOrdersCard.vue
#zpayments/components/UserOrdersCard      ← without extension
```

### Exposing shared utilities / entities

```ts
for (const [path, mod] of Object.entries(import.meta.glob('./../shared/**'))) {
    const id = path.replace('../shared/', '#zpayments/shared/')

    globalThis.imports[id] = mod
    globalThis.imports[id.replace('.ts', '')] = mod
}
```

This registers every file under `modules/zenith-payments/shared/` as `#zpayments/shared/…`.

---

## Target module — declaring the dependency

### 1. `module.json`

Tell the build system that imports from `#zpayments` are external and should be routed through `globalThis.importAsync` at runtime:

```json
{
  "dependencies": {
    "zenith-payments": {}
  },
  "build": {
    "imports": [
      { "from": "#zpayments", "type": "global_import" }
    ]
  }
}
```

- `dependencies` documents the runtime dependency on the source module.
- `build.imports` tells the Vite build to externalize `#zpayments` (and any subpath like `#zpayments/components/…`) and rewrite those imports to `await globalThis.importAsync("…")`.

### 2. Use the alias in your code

Once declared, you can import from the source module's alias just like any other package:

```ts
import UserOrdersCard from '#zpayments/components/UserOrdersCard.vue'
import type { Order } from '#zpayments/shared/entities/order.entity'
```

At build time the import rewriter turns these into:

```ts
const __m__ = await globalThis.importAsync("#zpayments/components/UserOrdersCard.vue");
const UserOrdersCard = __m__.default || __m__;
```

At runtime this resolves against whatever the source module registered in `onRegister()`.

---

## Execution order guarantee

`onRegister()` runs for **all** enabled modules before `onLoad()` starts. This means a target module can safely use exported symbols from a source module inside its own `onLoad()` — the source's `globalThis.imports` entries are always ready in time.

```
all modules  →  onRegister()   ← source registers its exports here
all modules  →  onLoad()       ← target can safely import from source here
```

---

## Summary checklist

**Source module (`zenith-payments`)**
- [ ] Choose a unique alias (e.g. `#zpayments`)
- [ ] Register components/utils on `globalThis.imports` in `onRegister()`

**Target module (`artlyze`)**
- [ ] Add source to `dependencies` in `module.json`
- [ ] Add `{ "from": "#zpayments", "type": "global_import" }` to `build.imports` in `module.json`
- [ ] Run `module:build` for the target module after changing `module.json`
- [ ] Import using the alias: `import Foo from '#zpayments/components/Foo.vue'`
