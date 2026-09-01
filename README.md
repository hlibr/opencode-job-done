# opencode-say-done

Quiet voice notification for opencode — says "Job done" when a session goes idle.

## Install

**Global (all projects):**
```bash
mkdir -p ~/.config/opencode/plugins
cp say-done.js ~/.config/opencode/plugins/say-done.js
# or
cp .opencode/plugins/say-done.js ~/.config/opencode/plugins/
```

**Project (this repo):**
- Plugin is already at `.opencode/plugins/say-done.js` — auto-loaded by opencode.

Restart opencode after install.

## How it works

Hooks `session.idle` event and plays quietly:

```js
await $`say -o /tmp/jobdone.aiff "Job done" && afplay -v 0.3 /tmp/jobdone.aiff`
```

`afplay -v 0.3` controls volume (0.0–1.0) without changing system volume.

## Files

- `.opencode/plugins/say-done.js` — project plugin (auto-loaded)
- `say-done.js` — standalone copy for global install
