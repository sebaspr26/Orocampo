"use client";
import { useState, useRef, useEffect, useId } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Buscar...", required, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const selected = options.find(o => o.value === value);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(opt: Option) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
    if (e.key === "Enter" && filtered.length === 1) { handleSelect(filtered[0]); }
  }

  const baseInput = "w-full pl-4 pr-10 py-3 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] focus:outline-none focus:ring-1 focus:ring-[#d4af37] text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden native input for form validation */}
      <input
        type="text"
        required={required}
        readOnly
        value={value}
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 opacity-0 pointer-events-none w-full"
        id={id}
      />

      {/* Trigger */}
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`${baseInput} flex items-center justify-between text-left ${!selected ? "text-[#a09880]" : ""}`}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {selected && (
              <span
                onClick={handleClear}
                className="material-symbols-outlined text-[16px] text-[#7f7663] hover:text-[#ba1a1a] cursor-pointer"
              >
                close
              </span>
            )}
            <span className="material-symbols-outlined text-[18px] text-[#7f7663]">expand_more</span>
          </span>
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nombre..."
          className={`${baseInput} pr-10`}
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-xl border border-[#f0eded] overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[#7f7663]">Sin resultados para "{query}"</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.map(opt => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      opt.value === value
                        ? "bg-[#d4af37]/10 text-[#735c00] font-semibold"
                        : "text-[#1c1b1b] hover:bg-[#f6f3f2]"
                    }`}
                  >
                    {opt.value === value && (
                      <span className="material-symbols-outlined text-[14px] mr-1.5 align-middle text-[#735c00]">check</span>
                    )}
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
