"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: "home", href: "/", label: "Home" },
  { icon: "chat_bubble", href: "/chat", label: "Messages" },
  { icon: "person", href: "/contacts", label: "Contacts" },
  { icon: "bookmark", href: "/saved", label: "Saved" },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-16 flex-col items-center border-r border-[var(--border)] bg-[var(--bg-sidebar)] py-4 gap-1">
      <span
        className="mb-4 text-[11px] font-extrabold tracking-[0.15em] text-[var(--accent)]"
        style={{ fontFamily: "var(--font-display)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        VOID
      </span>
      {navItems.map(({ icon, href, label }) => (
        <Link
          key={href}
          href={href}
          title={label}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--text-muted)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
            pathname === href && "bg-[var(--accent-dim)] text-[var(--accent-text)]"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
        </Link>
      ))}
      <div className="flex-1" />
      <Link href="/settings" title="Settings" className="flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--text-muted)] transition-all hover:bg-[var(--bg-hover)]">
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>settings</span>
      </Link>
      <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#6c3bff] to-[#a855f7] text-[13px] font-bold text-white mb-2">
        FO
      </div>
    </nav>
  );
}