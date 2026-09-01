export const SayDonePlugin = async ({ project, client, $, directory, worktree }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        try {
          await $`say -o /tmp/jobdone.aiff "Job done" && afplay -v 0.3 /tmp/jobdone.aiff`
        } catch {}
      }
    },
  }
}

export default SayDonePlugin
