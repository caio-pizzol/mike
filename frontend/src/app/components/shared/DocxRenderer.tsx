"use client";

import { isSuperDocEnabled } from "@/app/lib/featureFlags";
import { DocxView } from "./DocxView";
import { SuperDocxView } from "./SuperDocxView";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof DocxView>;

/**
 * Single dispatch point between Mike's existing `docx-preview` viewer
 * (`DocxView`) and the SuperDoc-backed `SuperDocxView`. Toggled via
 * `NEXT_PUBLIC_SUPERDOC_ENABLED`. Both implementations share the same
 * props contract so callers don't branch.
 */
export function DocxRenderer(props: Props) {
    if (isSuperDocEnabled()) return <SuperDocxView {...props} />;
    return <DocxView {...props} />;
}
