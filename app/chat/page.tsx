"use client";

import { useState } from "react";
import { NavRail } from "@/components/chat/NavRail";
import { ThreadsPanel, type Thread } from "@/components/chat/ThreadsPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const THREADS: Thread[] = [
  {
    id: "1",
    name: "Lee min ho",
    preview: "The architectural void is ready for...",
    time: "2m",
    online: true,
    initials: "LMH",
    avatarColor: "linear-gradient(135deg, #3b3060, #6c3bff)",
  },
  {
    id: "2",
    name: "Park seon joon",
    preview: "Did you see the new gradients?",
    time: "1h",
    unread: 3,
    initials: "PSJ",
    avatarColor: "linear-gradient(135deg, #1a3a2a, #1d9e75)",
  },
  {
    id: "3",
    name: "Gong yoon",
    preview: "Let's connect on the spatial design.",
    time: "Yesterday",
    initials: "GY",
    avatarColor: "linear-gradient(135deg, #3a1a2a, #d4537e)",
  },
];

export default function ChatPage() {
  const [activeThreadId, setActiveThreadId] = useState("1");

  const activeThread = THREADS.find((t) => t.id === activeThreadId) ?? THREADS[0];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ThemeToggle />

      <div className="hidden sm:block flex-shrink-0">
        <NavRail />
      </div>

      <div className="hidden md:block w-[300px] lg:w-[320px] flex-shrink-0 h-full">
        <ThreadsPanel
          threads={THREADS}
          activeId={activeThreadId}
          onSelect={setActiveThreadId}
        />
      </div>

      <div className="flex-1 min-w-0 h-full">
      <ChatPanel 
  contactId={activeThread.id}      
  contactName={activeThread.name}
  contactInitials={activeThread.initials} 
  isOnline={activeThread.online} 
/>
      </div>
    </div>
  );
}