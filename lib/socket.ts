const WS_URL = "wss://whisperbox.koyeb.app/ws";

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

import type { EncryptedPayload, Message } from "./api";

export interface SocketHandlers {
  onMessage: (message: Message) => void;
  onUserOnline: (userId: string) => void;
  onUserOffline: (userId: string) => void;
  onError: (detail: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class SocketManager {
  private ws: WebSocket | null = null;
  private token: string;
  private handlers: SocketHandlers;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(token: string, handlers: SocketHandlers) {
    this.token = token;
    this.handlers = handlers;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.handlers.onConnected?.();
    };

    this.ws.onmessage = (event) => {
      this.handleEvent(event.data);
    };

    this.ws.onclose = () => {
      this.handlers.onDisconnected?.();
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.handlers.onError("WebSocket connection error.");
    };
  }


  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }


  reconnect(newToken: string): void {
    this.token = newToken;
    this.shouldReconnect = true;
    this.ws?.close();
    this.connect();
  }


  sendMessage(to: string, payload: EncryptedPayload): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.handlers.onError("Not connected. Message not sent.");
      return;
    }

    this.ws.send(
      JSON.stringify({
        event: "message.send",
        to,
        payload,
      })
    );
  }


  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }


  private handleEvent(raw: string): void {
    let data: Record<string, unknown>;

    try {
      data = JSON.parse(raw);
    } catch {
      this.handlers.onError("Received malformed message from server.");
      return;
    }

    switch (data.event) {
      case "message.receive":
        this.handlers.onMessage(data as unknown as Message);
        break;

      case "user.online":
        this.handlers.onUserOnline(data.user_id as string);
        break;

      case "user.offline":
        this.handlers.onUserOffline(data.user_id as string);
        break;

      case "error":
        this.handlers.onError(data.detail as string);
        break;

      default:
        break;
    }
  }


  private scheduleReconnect(): void {
     this.shouldReconnect = false;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.handlers.onError(
        "Connection lost. Please refresh the page to reconnect."
      );
      return;
    }

    const delay = RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}