"use client";

import { useState, useRef } from "react";
import { usersApi, type SearchUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface UserSearchProps {
  onSelectUser: (user: SearchUser) => void;
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) return;
      const users = await usersApi.search(q, token);
      setResults(users);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(q), 400);
  }

  function handleSelect(user: SearchUser) {
    onSelectUser(user);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative px-4 py-3">
      <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-2">
        <span
          className="material-symbols-outlined text-[var(--text-muted)]"
          style={{ fontSize: 18 }}
        >
          {isSearching ? "sync" : "person_search"}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Find someone..."
          className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              close
            </span>
          </button>
        )}
      </div>

      {results.length > 0 && (
        <ul className="absolute left-4 right-4 top-full z-20 mt-1 overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg">
          {results.map((user) => (
            <li key={user.id}>
              <button
                onClick={() => handleSelect(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6c3bff] to-[#a855f7] text-[12px] font-semibold text-white">
                  {user.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {user.display_name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    @{user.username}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-[11px] text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}