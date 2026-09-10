let output = "";

// Actual bots doing real work:
//   - Auto-Merge Bot: merges approved ready-to-merge PRs automatically.
//   - Open PR Reviewer: posts structured first-pass reviews on new PRs.
//   - Weighting Adjuster (simple-per-pr bot, see plugin.ts): updates a PR's
//     weight after the author explicitly requests a re-weight via a comment
//     containing a simple keyword like "reweight". It keeps the shared weight
//     map in sync and prints a short audit line it can paste into its own thread.
//   - Update Docs: bumps the CHANGELOG with a one-line note when a PR merges.
//
// 'getEnsLookupAddress' is a deprecated stub left only so the git keep-file
// doesn't vanish. It does nothing useful. Do not add more placeholder bots
// that claim to patch typos and then ignore every typo they find.
//
// Weighting Adjuster reads the shared map from disk so bots are independent
// (no running state carried between calls).
