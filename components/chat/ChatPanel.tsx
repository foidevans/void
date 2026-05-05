"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { SocketManager } from "@/lib/socket";
import { conversationsApi, usersApi, messagesApi, type Message as ApiMessage } from "@/lib/api";
import {
  encryptMessage,
  decryptMessage,
  importPublicKey,
  type EncryptedPayload,
} from "@/lib/crypto";
import { MessageBubble, type Message } from "./MessageBubble";

interface ChatPanelProps {
  contactId: string;
  contactName: string;
  contactInitials: string;
  isOnline?: boolean;
}

export function ChatPanel({
  contactId,
  contactName,
  contactInitials,
  isOnline = false,
}: ChatPanelProps) {
  // const { user, privateKey, getToken } = useAuth();
  const { user, privateKey, getToken, accessToken } = useAuth();  

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [decryptError, setDecryptError] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<SocketManager | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contactPublicKeyRef = useRef<CryptoKey | null>(null);
  const myPublicKeyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const decryptApiMessage = useCallback(
    async (msg: ApiMessage): Promise<Message> => {
      if (!privateKey) throw new Error("No private key");
      const isMine = msg.from_user_id === user?.id;
      try {
        const plaintext = await decryptMessage(
          msg.payload as EncryptedPayload,
          privateKey,
          isMine
        );
        const time = new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          id: msg.id,
          text: plaintext,
          time,
          direction: isMine ? "out" : "in",
          read: msg.delivered,
        };
      } catch {
        return {
          id: msg.id,
          text: "[Encrypted message — could not decrypt]",
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          direction: isMine ? "out" : "in",
        };
      }
    },
    [privateKey, user?.id]
  );

  useEffect(() => {
    if (!contactId || !privateKey || !user) return;

    async function init() {
      setIsLoadingHistory(true);
      setDecryptError(false);
      try {
        const token = await getToken();
        if (!token) return;

        const { public_key } = await usersApi.getPublicKey(contactId, token);
        contactPublicKeyRef.current = await importPublicKey(public_key);

        myPublicKeyRef.current = await importPublicKey(user!.public_key);

        const history = await conversationsApi.getMessages(contactId, token, 50);
        const decrypted = await Promise.all(history.map(decryptApiMessage));
        setMessages(decrypted.reverse());
      } catch {
        setDecryptError(true);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    init();
  }, [contactId, privateKey, user]);

  useEffect(() => {
  if (!privateKey || !user || !accessToken) return;
    async function connectSocket() {
      const token = await getToken();
        console.log("Token at socket connect:", token);
      if (!token) return;

      const manager = new SocketManager(token, {
        onConnected: () => setSocketConnected(true),
        onDisconnected: () => setSocketConnected(false),

        onMessage: async (msg) => {
          if (
            msg.from_user_id !== contactId &&
            msg.to_user_id !== contactId
          ) return;

          const decrypted = await decryptApiMessage(msg);
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === decrypted.id)) return prev;
            return [...prev, decrypted];
          });
        },

        onUserOnline: () => {},
        onUserOffline: () => {},
        onError: (detail) => console.error("Socket error:", detail),
      });

      manager.connect();
      socketRef.current = manager;
    }

    connectSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [privateKey, user, accessToken]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !privateKey || !user) return;
    if (!contactPublicKeyRef.current || !myPublicKeyRef.current) return;

    setInput("");
    setIsSending(true);

    try {
      const payload = await encryptMessage(
        text,
        contactPublicKeyRef.current,
        myPublicKeyRef.current
      );

      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const optimisticMsg: Message = {
        id: crypto.randomUUID(),
        text,
        time,
        direction: "out",
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      if (socketRef.current?.isConnected) {
        socketRef.current.sendMessage(contactId, payload);
      } else {
        const token = await getToken();
        if (token) await messagesApi.send(contactId, payload, token);
      }
    } catch {
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-full flex-col bg-[var(--bg-msg-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gradient-to-br from-[#3b3060] to-[#6c3bff] text-[13px] font-semibold text-white">
            {contactInitials}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">
              {contactName}
            </p>
            <p className="flex items-center gap-1 text-[12px]"
              style={{ color: isOnline ? "var(--success)" : "var(--text-muted)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: isOnline ? "var(--success)" : "var(--text-muted)" }}
              />
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span
            title={socketConnected ? "Connected" : "Connecting..."}
            className="mr-2 flex items-center gap-1 text-[11px]"
            style={{ color: socketConnected ? "var(--success)" : "var(--text-muted)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {socketConnected ? "wifi" : "wifi_off"}
            </span>
          </span>
          {(["call", "videocam", "info"] as const).map((icon) => (
            <button
              key={icon}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border-none bg-transparent text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {icon}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        {isLoadingHistory && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
              Decrypting messages...
            </p>
          </div>
        )}

        {decryptError && (
          <div className="rounded-[10px] border border-[var(--error)]/20 bg-[var(--error)]/5 px-4 py-3 text-[13px] text-[var(--error)]">
            Failed to load messages. Your keys may have changed.
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 opacity-40">
            <span className="material-symbols-outlined text-4xl">lock</span>
            <p className="text-[13px] text-[var(--text-muted)]">
              Start an encrypted conversation
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            senderInitials={contactInitials}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-[var(--border)] py-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 12, color: "var(--success)" }}
        >
          lock
        </span>
        End-to-end encrypted presence
      </div>

      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-hover)] py-2 pl-4 pr-2">
          <button className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              add_circle
            </span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak into the void..."
            disabled={isSending || isLoadingHistory}
            className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
          />

          <button className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              sentiment_satisfied
            </span>
          </button>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending || isLoadingHistory}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[var(--accent)] text-white transition-all hover:shadow-[0_0_16px_var(--accent-glow)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}