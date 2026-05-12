/**
 * Feature flags.
 *
 * NEXT_PUBLIC_* env vars are inlined into the client bundle at build time,
 * so flips require a redeploy. Sufficient for the Phase 1 SuperDoc spike
 * where rollout granularity is per-environment, not per-user.
 */

export function isSuperDocEnabled(): boolean {
    return process.env.NEXT_PUBLIC_SUPERDOC_ENABLED === "true";
}
