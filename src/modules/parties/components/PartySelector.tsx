"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PartyTypeBadge } from "@/modules/parties/components/PartyTypeBadge";
import type { PartySearchResult } from "@/modules/parties/types";
import { partyService } from "@/services/partyService";
import { cn } from "@/utils/cn";

type PartySelectorProps = {
  valueId?: string;
  valueName?: string;
  inputId?: string;
  placeholder?: string;
  disabled?: boolean;
  onSelect: (party: PartySearchResult) => void;
  onClear?: () => void;
};

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

function highlightMatch(label: string, query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return <>{label}</>;
  }

  const lowerLabel = label.toLowerCase();
  const lowerQuery = normalized.toLowerCase();
  const start = lowerLabel.indexOf(lowerQuery);

  if (start === -1) {
    return <>{label}</>;
  }

  const end = start + normalized.length;

  return (
    <>
      {label.slice(0, start)}
      <mark className="rounded bg-sky-100 px-0.5 text-foreground">{label.slice(start, end)}</mark>
      {label.slice(end)}
    </>
  );
}

export function PartySelector({
  valueId,
  valueName,
  inputId,
  placeholder = "Search party",
  disabled = false,
  onSelect,
  onClear,
}: PartySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const displayValue = open ? query : (valueName ?? "");
  const debouncedQuery = useDebouncedValue(displayValue, 300);

  const searchQuery = useQuery({
    queryKey: ["parties", "selector-search", debouncedQuery],
    queryFn: () => partyService.searchParties(debouncedQuery),
    staleTime: 20_000,
    enabled: open,
  });

  const options = searchQuery.data ?? [];
  const activeIndex = Math.min(highlightedIndex, Math.max(options.length - 1, 0));

  const selectedLabel = valueName ?? "";
  const hasSelection = Boolean(valueId && selectedLabel);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 pr-16"
          disabled={disabled}
          id={inputId}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(0);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery(valueName ?? "");
            setHighlightedIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!open) {
              if (event.key === "ArrowDown" || event.key === "Enter") {
                setQuery(valueName ?? "");
                setHighlightedIndex(0);
                setOpen(true);
              }
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((previous) => Math.min(previous + 1, options.length - 1));
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((previous) => Math.max(previous - 1, 0));
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const selected = options[activeIndex];
              if (!selected) {
                return;
              }

              onSelect(selected);
              setQuery(selected.name);
              setOpen(false);
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          value={displayValue}
        />

        <div className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1">
          {hasSelection && onClear ? (
            <button
              aria-label="Clear selected party"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
              onClick={() => {
                onClear();
                setQuery("");
                setHighlightedIndex(0);
                setOpen(false);
              }}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {open ? (
        <div className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background p-1 shadow-sm">
          {searchQuery.isLoading ? (
            <div className="space-y-1 p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-8 animate-pulse rounded bg-muted" key={index} />
              ))}
            </div>
          ) : null}

          {!searchQuery.isLoading && options.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No matching parties</p>
          ) : null}

          {!searchQuery.isLoading && options.length > 0 ? (
            <ul>
              {options.map((party, index) => (
                <li key={party.id}>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                      index === activeIndex ? "bg-muted" : "",
                    )}
                    onClick={() => {
                      onSelect(party);
                      setQuery(party.name);
                      setHighlightedIndex(index);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    type="button"
                  >
                    <span className="min-w-0 truncate">
                      {highlightMatch(party.name, displayValue)}
                    </span>
                    <span className="ml-2 inline-flex items-center gap-2">
                      <PartyTypeBadge type={party.type} />
                      {party.id === valueId ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {hasSelection ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Selected: <Fragment>{selectedLabel}</Fragment>
        </p>
      ) : null}
    </div>
  );
}
