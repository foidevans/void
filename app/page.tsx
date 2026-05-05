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

  useEffect(() => {
    if (!isLoading && !accessToken) router.push("/login");
  }, [isLoading, accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    async function load() {
      const token = await getToken();
      if (!token) return;
      const data = await conversationsApi.list(token);
      setConversations(data);
      if (data.length > 0) setActiveContactId(data[0].user_id);
    }
    load();
  }, [accessToken]);

  const threads: Thread[] = conversations.map((c) => ({
    id: c.user_id,
    name: c.display_name,
    preview: "Click to open conversation",
    time: new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    initials: c.display_name.slice(0, 2).toUpperCase(),
    avatarColor: "linear-gradient(135deg, #3b3060, #6c3bff)",
    online: onlineUsers.has(c.user_id),
  }));

  const activeThread = threads.find((t) => t.id === activeContactId);

  function handleSelectUser(u: SearchUser) {
    if (!conversations.some((c) => c.user_id === u.id)) {
      setConversations((prev) => [{
        user_id: u.id, display_name: u.display_name,
        username: u.username, last_message_at: new Date().toISOString(),
      }, ...prev]);
    }
    setActiveContactId(u.id);
  }

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
      <p className="text-[12px] uppercase tracking-widest text-[var(--text-muted)]">Initializing...</p>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ThemeToggle />
      <div className="hidden flex-shrink-0 sm:block"><NavRail /></div>
      <div className="hidden h-full w-[300px] flex-shrink-0 flex-col md:flex lg:w-[320px]">
        <UserSearch onSelectUser={handleSelectUser} />
        <div className="flex-1 overflow-hidden">
          <ThreadsPanel threads={threads} activeId={activeContactId ?? ""} onSelect={setActiveContactId} />
        </div>
      </div>
      <div className="flex h-full min-w-0 flex-1">
        {activeThread ? (
          <ChatPanel contactId={activeThread.id} contactName={activeThread.name}
            contactInitials={activeThread.initials} isOnline={activeThread.online} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 opacity-30">
            <span className="material-symbols-outlined text-5xl">chat_bubble</span>
            <p className="text-[14px] text-[var(--text-muted)]">Search for someone to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}