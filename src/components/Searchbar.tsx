import { useEffect, useRef } from "react";

export function SearchBar({
  value,
  setValue,
  onSubmit,
  size = "lg",
  loading = false,
  placeholder = "Enter a website — e.g. stripe.com",
  autoFocus = false,
}: {
  value: string;
  setValue: (v: string) => void;
  onSubmit: () => void;
  size?: "lg" | "sm";
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const lg = size === "lg";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit();
      }}
      className={`group relative flex items-center gap-2 rounded-xl border bg-[var(--ink-2)] transition focus-within:border-[var(--lime)]/60 focus-within:shadow-[0_0_0_4px_rgba(214,255,58,0.08)] ${
        lg ? "h-14 px-3" : "h-9 px-2"
      }`}
      style={{ borderColor: "var(--line-d)" }}
    >
      <span className={`grid shrink-0 place-items-center text-[var(--ink-mute)] transition group-focus-within:text-[var(--lime)] ${lg ? "pl-2" : "pl-1"}`}>
        <svg width={lg ? 20 : 16} height={lg ? 20 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      </span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={`flex-1 bg-transparent text-[var(--ink-text)] placeholder:text-[var(--ink-mute)] focus:outline-none ${
          lg ? "font-display text-xl" : "font-mono text-xs"
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="grid h-6 w-6 place-items-center rounded text-[var(--ink-mute)] hover:text-white"
          aria-label="clear"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--lime)] font-medium text-[var(--ink)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
          lg ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
        }`}
      >
        {loading ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: "spin 0.9s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.2-8.5" /></svg>
        ) : (
          <>
            {lg ? "Analyze" : "Go"}
            {lg && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            )}
          </>
        )}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  );
}
