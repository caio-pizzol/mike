"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
    Bold,
    ChevronDown,
    Italic,
    Redo2,
    Underline,
    Undo2,
} from "lucide-react";
import { useSuperDocCommand, useSuperDocUI } from "superdoc/ui/react";

// Curated short list. Keep it small — a long font picker pulls the
// surface in a direction Mike's chrome doesn't go. The labels are the
// values SuperDoc's `font-family` command expects.
const FONTS = [
    "Aptos",
    "Arial",
    "Calibri",
    "Georgia",
    "Times New Roman",
    "Verdana",
] as const;

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
            <FontPicker />
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

/**
 * `font-family`'s command value is the full CSS stack at the current
 * selection (e.g. `"Aptos Display, Arial, sans-serif"`). Extract the
 * first family so the picker label stays short and the active-state
 * check against FONTS works on a clean string.
 */
function firstFamily(stack: string): string {
    const first = stack.split(",")[0] ?? "";
    return first.replace(/['"]/g, "").trim();
}

function FontPicker() {
    const ui = useSuperDocUI();
    const cmd = useSuperDocCommand("font-family");
    const ready = !!ui;
    const disabled = !ready || cmd.disabled;
    const rawValue = (cmd.value as string | undefined) ?? "";
    const currentFamily = firstFamily(rawValue);
    const matchedFont = FONTS.find(
        (f) => f.toLowerCase() === currentFamily.toLowerCase(),
    );

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const next = e.target.value;
        if (!next) return;
        ui?.commands.get("font-family")?.execute(next);
    };

    return (
        <div className="relative">
            <select
                title={currentFamily ? `Font — ${currentFamily}` : "Font"}
                disabled={disabled}
                value={matchedFont ?? ""}
                onChange={handleChange}
                className="h-7 w-28 cursor-pointer appearance-none truncate rounded-md bg-transparent py-0 pl-2 pr-6 text-xs text-gray-700 hover:bg-gray-200 focus:outline-none disabled:opacity-30"
            >
                {!matchedFont && (
                    <option value="" disabled>
                        {currentFamily || "Font"}
                    </option>
                )}
                {FONTS.map((f) => (
                    <option key={f} value={f}>
                        {f}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
        </div>
    );
}
