"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Download, Loader2, Search } from "lucide-react";
import { SuperDocUIProvider, useSetSuperDoc } from "superdoc/ui/react";
import "@superdoc-dev/react/style.css";
import { MikeToolbar } from "./MikeToolbar";
import { SuggestionsSidebar } from "./SuggestionsSidebar";

const SuperDocEditor = dynamic(
    () => import("@superdoc-dev/react").then((m) => m.SuperDocEditor),
    { ssr: false },
);

const SAMPLE_URL = "/sample-review.docx";
const SAMPLE_FILENAME = "Sample Service Agreement.docx";

const MODULES = {
    comments: false as const,
    trackChanges: {
        visible: true as const,
        replacements: "paired" as const,
    },
};

const TELEMETRY = { enabled: false as const };

type Mode = "viewing" | "editing" | "suggesting";

// Minimal subset of the SuperDoc instance surface this demo needs. Keeps
// the demo free of the full type import while staying type-safe at the
// call sites below.
interface SearchMatch {
    [key: string]: unknown;
}
interface SuperDocLike {
    setDocumentMode: (mode: Mode) => void;
    search: (text: string) => SearchMatch[] | undefined;
    goToSearchResult: (match: SearchMatch) => void;
    export: (opts: { triggerDownload: boolean }) => Promise<Blob>;
}

export function SuperDocDemo() {
    return (
        <SuperDocUIProvider>
            <SuperDocDemoInner />
        </SuperDocUIProvider>
    );
}

function SuperDocDemoInner() {
    const setSuperDoc = useSetSuperDoc();
    const superdocRef = useRef<SuperDocLike | null>(null);
    const [mode, setMode] = useState<Mode>("viewing");
    const [query, setQuery] = useState("");
    const [searchError, setSearchError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<
        "idle" | "saving" | "saved" | "error"
    >("idle");
    const [savedBlob, setSavedBlob] = useState<Blob | null>(null);

    const handleMode = useCallback((next: Mode) => {
        setMode(next);
        superdocRef.current?.setDocumentMode(next);
    }, []);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (!trimmed) return;
            const sd = superdocRef.current;
            if (!sd) return;
            const matches = sd.search(trimmed);
            if (!matches || matches.length === 0) {
                setSearchError(`No matches for "${trimmed}"`);
                return;
            }
            setSearchError(null);
            sd.goToSearchResult(matches[0]);
        },
        [query],
    );

    const handleSave = useCallback(async () => {
        const sd = superdocRef.current;
        if (!sd) return;
        setSaveState("saving");
        try {
            const blob = await sd.export({ triggerDownload: false });
            setSavedBlob(blob);
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
        } catch (e) {
            console.error("[SuperDocDemo] export failed", e);
            setSaveState("error");
            setTimeout(() => setSaveState("idle"), 2500);
        }
    }, []);

    const handleDownloadSaved = useCallback(() => {
        if (!savedBlob) return;
        const url = URL.createObjectURL(savedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited-${SAMPLE_FILENAME}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, [savedBlob]);

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-serif text-sm text-gray-800">
                        {SAMPLE_FILENAME}
                    </span>
                    <span className="shrink-0 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        DEMO
                    </span>
                </div>

                <div className="mx-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
                    {(["viewing", "editing", "suggesting"] as const).map(
                        (m) => (
                            <button
                                key={m}
                                onClick={() => handleMode(m)}
                                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                                    mode === m
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {m === "viewing"
                                    ? "View"
                                    : m === "editing"
                                      ? "Edit"
                                      : "Suggest"}
                            </button>
                        ),
                    )}
                </div>

                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (searchError) setSearchError(null);
                            }}
                            placeholder="Jump to clause..."
                            className="w-56 rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saveState === "saving"}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-900 bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {saveState === "saving" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : saveState === "saved" ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : null}
                        {saveState === "saved"
                            ? "Version saved"
                            : saveState === "error"
                              ? "Save failed"
                              : "Save version"}
                    </button>
                    {savedBlob && (
                        <button
                            onClick={handleDownloadSaved}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            title="Download the saved version"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </header>

            {searchError && (
                <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-5 py-1.5 text-xs text-amber-900">
                    {searchError}
                </div>
            )}

            <div className="flex flex-1 overflow-hidden bg-gray-100">
                <div className="flex flex-1 items-stretch justify-center overflow-hidden p-4">
                    {/* Stock toolbar stays rendered so mode switches don't
                        rebuild the editor (hideToolbar is in the rebuild
                        dep array on @superdoc-dev/react). In View mode we
                        hide the toolbar container via CSS instead. */}
                    <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {mode !== "viewing" && <MikeToolbar />}
                        <div className="flex-1 overflow-hidden">
                            <SuperDocEditor
                                document={SAMPLE_URL}
                                documentMode={mode}
                                modules={MODULES}
                                telemetry={TELEMETRY}
                                hideToolbar
                                disableContextMenu
                                contained
                                style={{ height: "100%" }}
                                onReady={({
                                    superdoc,
                                }: {
                                    superdoc: unknown;
                                }) => {
                                    superdocRef.current =
                                        superdoc as SuperDocLike;
                                    setSuperDoc(superdoc);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <SuggestionsSidebar />
            </div>
        </div>
    );
}
