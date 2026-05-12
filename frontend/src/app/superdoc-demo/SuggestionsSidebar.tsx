"use client";

import { useCallback } from "react";
import { Check, FileText, X } from "lucide-react";
import {
    useSuperDocTrackChanges,
    useSuperDocUI,
} from "superdoc/ui/react";

/**
 * Right-rail "Suggestions" list. Subscribes to the tracked-changes slice
 * via useSuperDocTrackChanges() — items, total, activeId all stay live
 * with editor state. Accept/reject/scrollTo route through the controller
 * (ui.trackChanges.*) so the same call path the docs describe is on the
 * wire during the demo.
 */
export function SuggestionsSidebar() {
    const { items, activeId, total } = useSuperDocTrackChanges();
    const ui = useSuperDocUI();

    const handleScrollTo = useCallback(
        (id: string) => {
            ui?.trackChanges.scrollTo(id).catch((e) => {
                console.warn("[SuggestionsSidebar] scrollTo failed", e);
            });
        },
        [ui],
    );

    const handleAccept = useCallback(
        (id: string) => {
            ui?.trackChanges.accept(id);
        },
        [ui],
    );

    const handleReject = useCallback(
        (id: string) => {
            ui?.trackChanges.reject(id);
        },
        [ui],
    );

    return (
        <aside className="flex h-full w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">
                        Suggestions
                    </span>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {total}
                </span>
            </header>

            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-gray-400">
                        No tracked changes yet.
                        <br />
                        Switch to Suggest and start typing.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {items.map((item) => {
                            const c = item.change;
                            const isActive = item.id === activeId;
                            return (
                                <li
                                    key={item.id}
                                    onClick={() => handleScrollTo(item.id)}
                                    className={`group cursor-pointer px-4 py-3 transition-colors ${
                                        isActive
                                            ? "bg-amber-50"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                                c.type === "insert"
                                                    ? "bg-green-100 text-green-700"
                                                    : c.type === "delete"
                                                      ? "bg-red-100 text-red-700"
                                                      : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {c.type}
                                        </span>
                                        {c.author && (
                                            <span className="truncate text-[11px] text-gray-500">
                                                {c.author}
                                            </span>
                                        )}
                                    </div>

                                    {c.excerpt && (
                                        <p className="mb-2 line-clamp-2 font-serif text-xs text-gray-700">
                                            &ldquo;{c.excerpt}&rdquo;
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAccept(item.id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md border border-gray-900 bg-gray-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-gray-800"
                                        >
                                            <Check className="h-3 w-3" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReject(item.id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            <X className="h-3 w-3" />
                                            Reject
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
