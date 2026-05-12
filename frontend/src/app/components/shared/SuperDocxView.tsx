"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { MikeIcon } from "@/components/chat/mike-icon";
import { useFetchDocxBytes } from "@/app/hooks/useFetchDocxBytes";
import type { CitationQuote } from "./types";
import "@superdoc-dev/react/style.css";

// Lazy-load both the React wrapper and the UI provider. SuperDoc touches
// `window` during init and ships a heavy editor bundle; keep it out of the
// SSR path and the initial route chunk.
//
// `superdoc/ui/react` is the Custom UI surface — Mike's existing chat /
// EditCard / DocPanel UI drives the editor through the controller instead
// of mounting the stock toolbar / right-rail.
const SuperDocEditor = dynamic(
    () => import("@superdoc-dev/react").then((m) => m.SuperDocEditor),
    { ssr: false },
);

const SuperDocUIProvider = dynamic(
    () => import("superdoc/ui/react").then((m) => m.SuperDocUIProvider),
    { ssr: false },
);

interface Props {
    documentId: string;
    versionId?: string | null;
    onReady?: () => void;
    /**
     * Tracked change to focus after render. Phase 1 stub — SuperDoc owns
     * tracked-change navigation natively. Mapping Mike's `ins_w_id` /
     * `del_w_id` to SuperDoc's tracked-change list is Phase 3 work.
     */
    highlightEdit?: {
        key: string;
        inserted_text?: string;
        deleted_text?: string;
        ins_w_id?: string | null;
        del_w_id?: string | null;
    } | null;
    refetchKey?: number;
    /**
     * Citation quotes to navigate to. Phase 1 stub — SuperDoc exposes
     * search/navigation through `useSuperDocUI()`; wiring is Phase 1.5.
     */
    quotes?: CitationQuote[];
    warning?: string | null;
    onWarningDismiss?: () => void;
    /** Scroll position bookkeeping is owned by SuperDoc; props ignored. */
    initialScrollTop?: number | null;
    onScrollChange?: (scrollTop: number) => void;
    rounded?: boolean;
    bordered?: boolean;
}

// Trackchanges visible because the AI-review surface is the whole point
// of Mike's DOCX panel. The SuperDoc default for `documentMode: 'viewing'`
// resolves to `mode: 'original'` (no review markup) unless `visible: true`
// is set explicitly — see `normalize-track-changes-config.js`.
//
// `replacements: 'paired'` matches Mike's `document_edits` row shape:
// one proposed edit pairs `ins_w_id` + `del_w_id`. `'independent'` would
// split each replacement into two unrelated entities and break the
// 1-row-per-edit assumption the chat history relies on.
const MODULES = {
    comments: false as const,
    trackChanges: {
        visible: true as const,
        replacements: "paired" as const,
    },
};

const TELEMETRY = { enabled: false as const };

/**
 * SuperDoc-backed replacement for DocxView. Phase 1: viewer only, custom
 * UI surface (no built-in toolbar/right-rail), tracked changes visible
 * but accept/reject stays on Mike's existing backend round-trip.
 */
export function SuperDocxView({
    documentId,
    versionId,
    refetchKey,
    quotes,
    highlightEdit,
    warning,
    onWarningDismiss,
    rounded = true,
    bordered = true,
}: Props) {
    const { bytes, loading, error } = useFetchDocxBytes(
        documentId,
        versionId,
        refetchKey,
    );

    // SuperDoc takes File | Blob | URL. Cache the File across renders so
    // the `document` prop only changes when the underlying bytes do —
    // otherwise the React wrapper rebuilds the editor every render.
    const file = useMemo(() => {
        if (!bytes) return null;
        return new File([bytes], `${documentId}.docx`, {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
    }, [bytes, documentId]);

    // Phase 1 stubs — log so it's visible in the dev console which Mike
    // features are not yet wired through SuperDoc.
    useEffect(() => {
        if (quotes?.length) {
            console.log("[SuperDocxView] citation quotes ignored in Phase 1", {
                count: quotes.length,
            });
        }
    }, [quotes]);
    useEffect(() => {
        if (highlightEdit) {
            console.log(
                "[SuperDocxView] highlightEdit ignored in Phase 1",
                highlightEdit,
            );
        }
    }, [highlightEdit]);

    return (
        <div
            className={`relative flex flex-1 flex-col overflow-hidden ${bordered ? "border border-gray-200" : ""} ${rounded ? "rounded-xl" : ""}`}
        >
            {warning && (
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
                    <span className="truncate">{warning}</span>
                    {onWarningDismiss && (
                        <button
                            onClick={onWarningDismiss}
                            className="shrink-0 rounded p-0.5 hover:bg-amber-100"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}

            <div className="relative flex-1 overflow-hidden bg-gray-100">
                {loading || !file ? (
                    <div className="flex h-full items-center justify-center">
                        <MikeIcon spin mike size={28} />
                    </div>
                ) : error ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                ) : (
                    <SuperDocUIProvider>
                        <SuperDocEditor
                            document={file}
                            documentMode="viewing"
                            modules={MODULES}
                            telemetry={TELEMETRY}
                            hideToolbar
                            disableContextMenu
                            contained
                            style={{ height: "100%" }}
                        />
                    </SuperDocUIProvider>
                )}
            </div>
        </div>
    );
}
