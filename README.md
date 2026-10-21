# opencode-job-done

Says **"Job done"** when a turn finishes.

## Requirements

- macOS (uses built-in `say` + `afplay`)
- opencode >= 2 (v2 plugin API)

## Install

### Global — all projects (recommended)

```bash
git clone https://github.com/hlibr/opencode-job-done.git
mkdir -p ~/.config/opencode/plugins
cp opencode-job-done/job-done.js ~/.config/opencode/plugins/job-done.js
```

Quit and restart opencode.

### Per-project

```bash
mkdir -p .opencode/plugins
cp /path/to/opencode-job-done/job-done.js .opencode/plugins/job-done.js
```

Restart opencode.

## Customize

Volume is `afplay -v 0.3` in `job-done.js` — scale `0.0` (silent) to `1.0` (full). Edit to taste.

The message is the `MESSAGE` constant, and the words that trigger the
announcement are the `DONE` set (`session.execution.succeeded`,
`session.execution.failed`, `session.execution.interrupted`).

## How it works

`job-done.js` default-exports a v2 plugin definition and subscribes to the
server event stream:

```js
export default Plugin.define({
  id: "job-done-...",
  setup(ctx) {
    for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
      if (event.type === "session.execution.succeeded") await announce()
    }
    return () => controller.abort()
  },
})
```

See [opencode Plugins](https://opencode.ai/v2/docs/build/plugins) and
[Events](https://opencode.ai/v2/docs/build/plugins#events).

### Notes on multiple copies

OpenCode loads every copy of the plugin it finds, and it instantiates a plugin
once per open project location. The plugin therefore:

- derives its `id` from the file location, so a global and a project copy do
  not collide as a duplicate plugin id, and
- claims an announcement once per session, so the copies do not talk over each
  other.

## Migrating from v1

The v1 plugin API is gone in v2. A v1 plugin returned an object of hooks; a v2
plugin default-exports `{ id, setup }` and registers everything through the
context:

| v1                                | v2                                    |
| --------------------------------- | ------------------------------------- |
| `export default async () => ({})` | `export default Plugin.define({...})` |
| returned `event` hook             | `ctx.event.subscribe()`               |
| `$` Bun shell helper              | `node:child_process`                  |
| `session.idle` event              | `session.execution.*` events          |

The full guide is [Migrate plugins from V1](https://opencode.ai/v2/docs/build/plugins/migrate-v1).

## Layout

- `job-done.js` — source of truth (copy this)
- `.opencode/plugins/job-done.js` — identical copy, auto-loaded when you open this repo as a project
