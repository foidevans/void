"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { conversationsApi, type Conversation } from "@/lib/api";
import { NavRail } from "@/components/chat/NavRail";
import { ThreadsPanel, type Thread } from "@/components/chat/ThreadsPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { UserSearch } from "@/components/chat/UserSearch";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { SearchUser } from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const { accessToken, isLoading, getToken } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [onlineUsers] = useState<Set<string>>(new Set());

  // On mobile: track whether we're viewing threads or chat
  const [mobileView, setMobileView] = useState<"threads" | "chat">("threads");

  useEffect(() => {
    if (!isLoading && !accessToken) router.push("/login");
  }, [isLoading, accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    async function load() {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await conversationsApi.list(token);
        setConversations(data);
        if (data.length > 0 && !activeContactId) {
          setActiveContactId(data[0].user_id);
        }
      } catch {
        // silent
      }
    }
    load();
  }, [accessToken]);

  const threads: Thread[] = conversations.map((c) => ({
    id: c.user_id,
    name: c.display_name,
    preview: "Tap to open conversation",
    time: new Date(c.last_message_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    initials: c.display_name.slice(0, 2).toUpperCase(),
    avatarColor: "linear-gradient(135deg, #3b3060, #6c3bff)",
    online: onlineUsers.has(c.user_id),
  }));

  const activeThread = threads.find((t) => t.id === activeContactId);

  function handleSelectThread(id: string) {
    setActiveContactId(id);
    setMobileView("chat"); // switch to chat view on mobile
  }

  function handleSelectUser(u: SearchUser) {
    if (!conversations.some((c) => c.user_id === u.id)) {
      setConversations((prev) => [
        {
          user_id: u.id,
          display_name: u.display_name,
          username: u.username,
          last_message_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setActiveContactId(u.id);
    setMobileView("chat");
  }

  function handleBack() {
    setMobileView("threads");
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
          Initializing...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ThemeToggle />

      {/* Nav rail — desktop only */}
      <div className="hidden flex-shrink-0 md:block">
        <NavRail />
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Threads panel */}
        <div className="hidden h-full w-[300px] flex-shrink-0 flex-col md:flex lg:w-[320px]">
          <UserSearch onSelectUser={handleSelectUser} />
          <div className="flex-1 overflow-hidden">
            <ThreadsPanel
              threads={threads}
              activeId={activeContactId ?? ""}
              onSelect={handleSelectThread}
            />
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex h-full min-w-0 flex-1">
          {activeThread ? (
            <ChatPanel
              contactId={activeThread.id}
              contactName={activeThread.name}
              contactInitials={activeThread.initials}
              isOnline={activeThread.online}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 opacity-30">
              <span className="material-symbols-outlined text-5xl">chat_bubble</span>
              <p className="text-[14px] text-[var(--text-muted)]">
                Search for someone to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
        {mobileView === "threads" ? (
          /* Threads view */
          <div className="flex h-full flex-col">
            <UserSearch onSelectUser={handleSelectUser} />
            <div className="flex-1 overflow-hidden">
              <ThreadsPanel
                threads={threads}
                activeId={activeContactId ?? ""}
                onSelect={handleSelectThread}
              />
            </div>

            {/* Mobile bottom tab bar */}
            <div className="flex items-center justify-around border-t border-[var(--border)] bg-[var(--bg-sidebar)] px-4 py-2">
              {[
                { icon: "home", label: "Home" },
                { icon: "chat_bubble", label: "Chats", active: true },
                { icon: "person_search", label: "Contacts" },
                { icon: "settings", label: "Settings" },
              ].map(({ icon, label, active }) => (
                <button
                  key={icon}
                  className="flex flex-col items-center gap-0.5 px-3 py-1"
                  style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    {icon}
                  </span>
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat view with back button */
          <div className="flex h-full flex-col">
            {activeThread ? (
              <ChatPanel
                contactId={activeThread.id}
                contactName={activeThread.name}
                contactInitials={activeThread.initials}
                isOnline={activeThread.online}
                onBack={handleBack}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 opacity-30">
                <span className="material-symbols-outlined text-5xl">chat_bubble</span>
                <p className="text-[14px] text-[var(--text-muted)]">
                  Select a conversation
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
