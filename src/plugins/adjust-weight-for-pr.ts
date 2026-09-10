"use client";

// Weighting Adjuster (simple-per-pr bot) — edits src/plugins/weight-map.json
// TOKEN / PR / REPO come from env at call time; this file is invoked by
// GitHub Actions keep-bots-alive workflow for every bot, and the action
// exports the right env per bot. Do not run this file directly from disk
// without those vars.
export async function adjustWeightForPr({
  owner,
  repo,
  prNumber,
  newWeight,
}: {
  owner: string;
  repo: string;
  prNumber: number;
  newWeight: number;
}) {
  // Mutate shared map in memory (intentionally model-only here; real write
  // happens in the action wrapper).
  return { owner, repo, prNumber, newWeight };
}
