# opencode-job-done

Says **"Job done"** once when a session finishes.

## Requirements

- macOS (uses built-in `say` + `afplay`)
- opencode >= 1.18

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

Volume is `afplay -v 0.3` in `job-done.js:6` — scale `0.0` (silent) to `1.0` (full). Edit to taste.

## How it works

`job-done.js:1` exports `JobDonePlugin` and listens for `session.idle`:

```js
event: async ({ event }) => {
  if (event.type === "session.idle") {
    await $`say -o /tmp/jobdone.aiff "Job done" && afplay -v 0.3 /tmp/jobdone.aiff`
  }
}
```

See [opencode Plugins — Events](https://opencode.ai/docs/plugins#events).

## Layout

- `job-done.js` — source of truth (copy this)
- `.opencode/plugins/job-done.js` — identical copy, auto-loaded when you open this repo as a project
