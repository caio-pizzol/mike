import { notFound } from "next/navigation";
import { isSuperDocDemoEnabled } from "@/app/lib/featureFlags";
import { SuperDocDemo } from "./SuperDocDemo";

/**
 * Unauthenticated demo route. Lives outside the `(pages)` group so it
 * skips Mike's auth layout. Hard-gated by NEXT_PUBLIC_SUPERDOC_DEMO so
 * production deploys never expose it accidentally.
 */
export default function SuperDocDemoPage() {
    if (!isSuperDocDemoEnabled()) notFound();
    return <SuperDocDemo />;
}
