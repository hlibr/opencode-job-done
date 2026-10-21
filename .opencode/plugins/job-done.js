import { spawn } from "node:child_process"
import { Plugin } from "@opencode/plugin"

const MESSAGE = "Job done"
const VOLUME = "0.3"
const AUDIO_FILE = "/tmp/jobdone.aiff"

// OpenCode v1 published "session.idle" when a turn ended. v2 replaced it with
// the session execution events, so the announcement is driven by those.
const DONE = new Set([
  "session.execution.succeeded",
  "session.execution.failed",
  "session.execution.interrupted",
])

// The same plugin file can be installed more than once (globally and per
// project). OpenCode loads every copy it finds, so the id is derived from the
// file location to keep the copies apart, and an announcement is claimed once
// per session so the copies do not talk over each other.
const CLAIM = Symbol.for("opencode.job-done.claim")

function fingerprint(value) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}

const claim = (globalThis[CLAIM] ??= { sessionID: undefined, at: 0 })

function claimed(sessionID) {
  const now = Date.now()
  if (claim.sessionID === sessionID && now - claim.at < 1000) return false
  claim.sessionID = sessionID
  claim.at = now
  return true
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore" })
    child.once("error", reject)
    child.once("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

async function announce() {
  try {
    await run("say", ["-o", AUDIO_FILE, MESSAGE])
    await run("afplay", ["-v", VOLUME, AUDIO_FILE])
  } catch {
    // Announcing is best effort, never fail the session over it.
  }
}

export default Plugin.define({
  id: `job-done-${fingerprint(import.meta.url ?? "")}`,
  setup(ctx) {
    const controller = new AbortController()
    // Ignore events that were recorded before this plugin was loaded.
    const loadedAt = Date.now()

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          if (!DONE.has(event.type)) continue
          if (event.created < loadedAt) continue
          if (!claimed(event.data.sessionID)) continue
          await announce()
        }
      } catch {
        // The stream ends when the plugin is unloaded.
      }
    })()

    return () => controller.abort()
  },
})
