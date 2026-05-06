// "use client";

// import { cn } from "@/lib/utils";

// export interface Thread {
//   id: string;
//   name: string;
//   preview: string;
//   time: string;
//   unread?: number;
//   online?: boolean;
//   initials: string;
//   avatarColor: string;
// }

// interface ThreadsPanelProps {
//   threads: Thread[];
//   activeId: string;
//   onSelect: (id: string) => void;
// }

// export function ThreadsPanel({ threads, activeId, onSelect }: ThreadsPanelProps) {
//   return (
//     <aside className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)]">
//       <div className="border-b border-[var(--border)] px-4 pb-3 pt-5">
//         <div className="mb-3 flex items-center justify-between">
//           <h2 className="text-[18px] font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
//             Messages
//           </h2>
//           <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
//             <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit_square</span>
//           </button>
//         </div>
//         <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-2">
//           <span className="material-symbols-outlined text-[var(--text-muted)]" style={{ fontSize: 18 }}>search</span>
//           <input type="text" placeholder="Filter threads..." className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
//         </div>
//       </div>
//       <ul className="flex-1 overflow-y-auto py-2">
//         {threads.map((thread) => (
//           <li key={thread.id}>
//             <button
//               onClick={() => onSelect(thread.id)}
//               className={cn(
//                 "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]",
//                 activeId === thread.id && "bg-[var(--accent-dim)]"
//               )}
//             >
//               <div className="relative flex-shrink-0">
//                 <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: thread.avatarColor }}>
//                   {thread.initials}
//                 </div>
//                 {thread.online && (
//                   <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-sidebar)] bg-[var(--success)]" />
//                 )}
//               </div>
//               <div className="min-w-0 flex-1">
//                 <div className="flex items-center justify-between">
//                   <span className="text-[14px] font-semibold text-[var(--text-primary)]">{thread.name}</span>
//                   <span className="text-[11px] text-[var(--text-muted)]">{thread.time}</span>
//                 </div>
//                 <p className="truncate text-[13px] text-[var(--text-secondary)]">{thread.preview}</p>
//               </div>
//               {thread.unread && thread.unread > 0 && (
//                 <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold text-white">
//                   {thread.unread}
//                 </span>
//               )}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </aside>
//   );
// }


"use client";

import { cn } from "@/lib/utils";

export interface Thread {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  initials: string;
  avatarColor: string;
}

interface ThreadsPanelProps {
  threads: Thread[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ThreadsPanel({ threads, activeId, onSelect }: ThreadsPanelProps) {
  return (
    <aside className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-4 pb-3 pt-5">
        <div className="mb-1 flex items-center justify-between">
          <h2
            className="text-[18px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Messages
          </h2>
          <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              edit_square
            </span>
          </button>
        </div>
        <p className="mb-3 text-[12px] text-[var(--text-muted)]">
          Search above to find and message anyone
        </p>

        {/* Filter bar */}
        <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg-hover)] px-3 py-2">
          <span
            className="material-symbols-outlined text-[var(--text-muted)]"
            style={{ fontSize: 18 }}
          >
            filter_list
          </span>
          <input
            type="text"
            placeholder="Filter existing chats..."
            className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Thread list */}
      <ul className="flex-1 overflow-y-auto py-2">
        {threads.length === 0 ? (
          <li className="flex flex-col items-center justify-center gap-2 px-4 py-12 opacity-40">
            <span className="material-symbols-outlined text-4xl">
              chat_bubble_outline
            </span>
            <p className="text-center text-[13px] text-[var(--text-muted)]">
              No conversations yet.{"\n"}Search for someone above to get started.
            </p>
          </li>
        ) : (
          threads.map((thread) => (
            <li key={thread.id}>
              <button
                onClick={() => onSelect(thread.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-hover)]",
                  activeId === thread.id && "bg-[var(--accent-dim)]"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-[14px] font-semibold text-white"
                    style={{ background: thread.avatarColor }}
                  >
                    {thread.initials}
                  </div>
                  {thread.online && (
                    <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-sidebar)] bg-[var(--success)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                      {thread.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {thread.time}
                    </span>
                  </div>
                  <p className="truncate text-[13px] text-[var(--text-secondary)]">
                    {thread.preview}
                  </p>
                </div>

                {thread.unread && thread.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold text-white">
                    {thread.unread}
                  </span>
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}