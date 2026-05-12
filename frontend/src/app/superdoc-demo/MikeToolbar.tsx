"use client";

import type { ReactNode } from "react";
import {
    Bold,
    Italic,
    Redo2,
    Underline,
    Undo2,
} from "lucide-react";
import { useSuperDocCommand, useSuperDocUI } from "superdoc/ui/react";

/**
 * Custom Mike-styled toolbar — replaces SuperDoc's stock toolbar. Five
 * commands keep the surface intentionally narrow so the demo doesn't
 * shift focus away from review/suggest. Each button binds to its own
 * `useSuperDocCommand(id)` so a typing burst re-renders only the
 * commands whose active/disabled state actually flipped.
 */
export function MikeToolbar() {
    return (
        <div
            className="flex shrink-0 items-center gap-0.5 border-b border-gray-200 bg-gray-50/60 px-3 py-1.5"
            role="toolbar"
            aria-label="Document toolbar"
        >
            <Btn id="bold" title="Bold (⌘B)">
                <Bold className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Btn>
            <Btn id="italic" title="Italic (⌘I)">
                <Italic className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Btn>
            <Btn id="underline" title="Underline (⌘U)">
                <Underline className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Btn>
            <Divider />
            <Btn id="undo" title="Undo (⌘Z)">
                <Undo2 className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Btn>
            <Btn id="redo" title="Redo (⌘⇧Z)">
                <Redo2 className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Btn>
        </div>
    );
}

function Btn({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    const ui = useSuperDocUI();
    const cmd = useSuperDocCommand(id);
    const ready = !!ui;
    const disabled = !ready || cmd.disabled;
    const active = cmd.active;

    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={() => ui?.commands.get(id)?.execute()}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
                active
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="mx-1 h-4 w-px bg-gray-200" />;
}
