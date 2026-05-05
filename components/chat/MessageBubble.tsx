import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  text: string;
  time: string;
  direction: "in" | "out";
  read?: boolean;
  isTyping?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  senderInitials?: string;
}

export function MessageBubble({ message, senderInitials = "?" }: MessageBubbleProps) {
  const isOut = message.direction === "out";

  return (
    <div className={cn("flex max-w-[75%] gap-2.5", isOut ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {!isOut && (
        <div className="flex h-[30px] w-[30px] flex-shrink-0 self-end items-center justify-center rounded-full bg-gradient-to-br from-[#3b3060] to-[#6c3bff] text-[11px] font-semibold text-white">
          {senderInitials}
        </div>
      )}
      <div className={cn("flex flex-col", isOut && "items-end")}>
        {message.isTyping ? (
          <div className="rounded-2xl rounded-bl-[4px] px-4 py-3" style={{ background: "var(--bg-msg-in)" }}>
            <div className="flex gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : (
          <div className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.55]",
            isOut ? "rounded-br-[4px] bg-[var(--bg-msg-out)] text-white" : "rounded-bl-[4px] bg-[var(--bg-msg-in)] text-[var(--text-primary)]"
          )}>
            {message.text}
          </div>
        )}
        {!message.isTyping && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] text-[var(--text-muted)]">{message.time}</span>
            {isOut && (
              <span className="material-symbols-outlined text-white/40" style={{ fontSize: 14 }}>
                {message.read ? "done_all" : "done"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}