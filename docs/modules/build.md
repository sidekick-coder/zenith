# Module Build System

This document explains how the module build pipeline works — from running the build command to loading modules at runtime in different environments.

## Overview

Each module ships its own client-side code (Vue components, routes, etc.) under `modules/<id>/client/`. Before a module can be used in production, its client code must be compiled into two separate bundles:

| Bundle | Output path | Purpose |
|--------|-------------|---------|
| **Node (SSR)** | `modules/<id>/client-dist/node/module.client.js` | Server-side rendering |
| **Browser** | `modules/<id>/client-dist/browser/module.client.js` | Served statically to the browser |

---

## CLI Commands

### `module:build`

Compiles a module's client code.

```bash
node index.ts module:build --module <name>
# or interactive (prompts for selection)
node index.ts module:build

# Optionally prepare (install deps) before building
node index.ts module:build --module <name> --prepare
```

Options:
- `-m, --module <name>` — name of the module to build
- `-p, --prepare` — run `modules.prepare()` before building

### `module:posbuild`

Runs any post-build steps for a module.

```bash
node index.ts module:posbuild <name>
```

---

## Build Pipeline (`ModuleBuilderService`)

The `ModuleBuilderService.build()` method drives the compilation. It runs two sequential Vite builds for each module.

### 1. Shared configuration

Both builds share a common Vite config:

- **Entry point:** `modules/<id>/client/module.client.ts`
- **Output format:** ES module (`es`), with a deterministic filename `module.client.js`
- **Manifest:** enabled (`manifest: true`)
- **CSS:** all CSS chunks are merged into a single `styles.css`
- **Public dir:** `modules/<id>/client/public`

### 2. Externalized dependencies

Modules must **not** bundle core framework packages. The build marks the following imports as external — they are resolved at runtime from the host application's global scope:

- `vue`
- `vue-router`
- `vue-sonner`
- `#client` (host client alias)
- `#shared` (host shared alias)
- `vee-validate`
- `reka-ui`

Modules can declare additional externals in `module.json` under `build.imports` (see [Declaring extra externals](#declaring-extra-externals) below).

### How the global import API works (`client/imports.ts`)

The host registers all shareable packages on `globalThis.imports` (keyed by import id) and exposes `globalThis.importAsync(id)` as the resolver. This runs once at startup via `client/imports.ts`, imported by both entry points.

The host registers named packages (`vue`, `vue-router`, `vee-validate`, `reka-ui`, `vue-sonner`), every `#client/…` file (`.ts` and `.vue`), and every `#shared/…` file. Modules themselves can also register their own exports onto `globalThis.imports` during `onRegister()` so other modules can consume them — see [Cross-Module Imports](./cross-module-imports.md).

When the compiled bundle calls `await globalThis.importAsync("vue")` it gets back the exact instance the host is already using — no duplication.

When a module needs to use a library that isn't in the default list, declare it in `module.json` under `build.imports`. This both externalizes it from the bundle **and** tells the import rewriter to route it through `globalThis.importAsync`. The library must also be registered on `globalThis.imports` before the module loads.

```json
{
  "build": {
    "imports": [
      { "from": "some-lib", "type": "global_import" }
    ]
  }
}
```

### 3. Import rewriting (`createViteImportReplacerPlugin`)

A custom Vite plugin post-processes the output chunks and rewrites every static `import` statement and dynamic `import()` call that references an externalized package. Instead of a real ES import, the compiled bundle calls `globalThis.importAsync(id)` — a function provided by the host application.

**Static imports** are rewritten based on their specifier type:

```ts
// source (module code)
import { ref } from 'vue'
import type { Router } from 'vue-router'
import MyComp from '#client/components/MyComp.vue'

// compiled output
const { ref: ref } = await globalThis.importAsync("vue");
const __module__Router__ = await globalThis.importAsync("vue-router"); const Router = __module__Router__.default || __module__Router__;
const __module__MyComp__ = await globalThis.importAsync("#client/components/MyComp.vue"); const MyComp = __module__MyComp__.default || __module__MyComp__;
```

**Dynamic imports** are rewritten similarly:

```ts
// source
const mod = await import('vue-router')

// compiled output
const mod = await globalThis.importAsync("vue-router")
```

This means the module bundle has **zero copies** of any externalized dependency — it always uses whatever instance the host already loaded.

### 4. Node (SSR) build

```
ssr: true  →  outDir: modules/<id>/client-dist/node/
```

Produces a CommonJS-compatible SSR bundle used by the server renderer.

### 5. Browser build

```
ssr: false  →  outDir: modules/<id>/client-dist/browser/
```

Produces a browser-optimized bundle. `process.env` is stubbed out to an empty object and `NODE_ENV` is forced to `"production"`.

---

## Runtime Loading

After building, modules are loaded differently depending on the environment.

### Development (Node + Browser)

`ModulesDevService` uses Vite's `import.meta.glob` to import module source files directly — no pre-built artifacts are needed:

```
/modules/*/client/module.client.ts  →  lazy imported per manifest id
```

Only modules marked `enabled: true` in their manifest are loaded.

### Production — Server Side (Node)

`ModulesNodeService` loads the pre-built **Node bundle** using a dynamic `import()` with a `pathToFileURL` reference. A timestamp query param (`?t=...`) is appended to bust the Node module cache on each request cycle:

```
modules/<id>/client-dist/node/module.client.js
```

### Production — Client Side (Browser)

`ModulesBrowserService` loads the pre-built **Browser bundle** via a dynamic `import()` pointing to the static asset URL. A timestamp query param busts the browser cache:

```
/static/modules/<id>/browser/module.client.js
```

---

## Service Selection

The correct service is chosen automatically in both entry points.

**`entry-server.ts` (SSR)**

```ts
const useNodeService = config.get('modules.node.service') === 'node' || import.meta.env.PROD

di.set(ModulesService, useNodeService
    ? new ModulesNodeService(serviceOptions)
    : new ModulesDevService(serviceOptions)
)
```

**`entry-client.ts` (Browser hydration)**

```ts
const useBrowserService = config.get('modules.browser.service') === 'browser' || import.meta.env.PROD

di.set(ModulesService, useBrowserService
    ? new ModulesBrowserService(serviceOptions)
    : new ModulesDevService(serviceOptions)
)
```

In production (`import.meta.env.PROD === true`) both sides automatically use the pre-built bundles. In development both use `ModulesDevService` (Vite HMR, no build step required).

---

## Module Loading Flow

After the correct service is injected, modules are loaded during the application lifecycle:

1. **`discover()`** — populates `imports` map with lazy import functions keyed by module id
2. **`load()`** — iterates enabled manifests from the DI container, calls each import function, instantiates the module class, and calls `setData(manifest)` to hydrate it

```
manifest list (DI)
      │
      ▼
ModulesService.discover()   ← fills imports map
      │
      ▼
ModulesService.load()       ← imports each module, instantiates, sets data
      │
      ▼
lifecycle.register / load / boot
```

---

## Summary

| Stage | Dev | Production |
|-------|-----|-----------|
| Build required | No | Yes (`module:build`) |
| Server loads from | Source via glob | `client-dist/node/` |
| Browser loads from | Source via glob | `/static/modules/<id>/browser/` |
| External deps | Resolved by Vite | Resolved from host globals |

---

## GitHub Actions pipeline

Each module lives in its own repository and uses a `build` branch to store compiled artifacts. The workflow runs on every push to `main` (or manually via `workflow_dispatch`), rebuilds the `build` branch as a clean snapshot of `main` plus the compiled output, and pushes it. The host installs modules from their `build` branch so it always gets pre-compiled artifacts.

### The `build` branch strategy

The `build` branch is an **orphan** — it carries no shared history with `main`. On each run the working tree is wiped and replaced with a fresh snapshot of `main`, so the branch always contains exactly what `main` has plus `client-dist/`.

```yaml
- name: Prepare orphan build branch
  run: |
    git fetch origin

    if git show-ref --quiet refs/remotes/origin/build; then
      git checkout build
      git pull origin build
    else
      git checkout --orphan build
      git rm -rf .
      echo "# Build branch" > README.md
      git add README.md
      git commit -m "Initial build branch"
    fi

    # Replace working tree with main's snapshot (no history merge)
    git rm -rf .
    git checkout origin/main -- .
```

After compilation, all files plus `client-dist/` are staged and committed only if there are actual changes:

```yaml
- name: Commit and push build snapshot
  run: |
    git add -A
    git add -f client-dist/**

    if git diff --cached --quiet; then
      echo "No changes to commit"
      exit 0
    fi

    MAIN_SHA=$(git rev-parse origin/main)
    git commit -m "Build from main@${MAIN_SHA} — $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin build
```

---

### Simple module (no cross-module dependencies)

Mount the module directory into the Zenith container at `/app/modules/<id>` and run `module:build --prepare` to install npm deps and compile:

```yaml
name: Build

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Docker
        uses: docker/setup-buildx-action@v3

      - name: Configure Git
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'

      - name: Prepare orphan build branch
        run: |
          git fetch origin

          if git show-ref --quiet refs/remotes/origin/build; then
            git checkout build
            git pull origin build
          else
            git checkout --orphan build
            git rm -rf .
            echo "# Build branch" > README.md
            git add README.md
            git commit -m "Initial build branch"
          fi

          git rm -rf .
          git checkout origin/main -- .

      - name: Install dependencies
        run: npm install

      - name: Build artifacts
        run: |
          docker run --rm \
            -v ./:/app/modules/my-module \
            zzhenryquezz/zenith:latest \
            node arte module:build --prepare true -m my-module

      - name: Commit and push build snapshot
        run: |
          git add -A
          git add -f client-dist/**

          if git diff --cached --quiet; then
            echo "No changes to commit"
            exit 0
          fi

          MAIN_SHA=$(git rev-parse origin/main)
          git commit -m "Build from main@${MAIN_SHA} — $(date '+%Y-%m-%d %H:%M:%S')"
          git push origin build
```

Replace `my-module` with your module's id in both the volume mount path and the `-m` flag.

---

### Module with cross-module dependencies

When a module depends on another (see [Cross-Module Imports](./cross-module-imports.md)), run `module:install` inside the container before building. It clones the dependency's `build` branch so its pre-built artifacts and registered exports are available during compilation.

Change only the **Build artifacts** step:

```yaml
      - name: Build artifacts
        run: |
          docker run --rm \
            -v ./:/app/modules/my-module \
            zzhenryquezz/zenith:latest \
            sh -c "node arte module:install https://github.com/your-org/source-module.git && \
                   node arte module:build --prepare true -m my-module"
```

For multiple dependencies, chain additional `module:install` calls:

```yaml
sh -c "node arte module:install https://github.com/your-org/dep-a.git && \
       node arte module:install https://github.com/your-org/dep-b.git && \
       node arte module:build --prepare true -m my-module"
```
