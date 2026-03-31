// app/lib/ws-client.ts
// WebSocket client for communicating with the Python game server.

import type { WSMessage } from "@/app/types/game";

/** Default server address matching the Python ws_main.py default. */
const DEFAULT_URL = "ws://localhost:8765";

type MessageHandler = (msg: WSMessage) => void;

/**
 * Thin wrapper around the browser WebSocket API.
 *
 * Handles automatic reconnection, JSON serialisation, and
 * distributes incoming messages to registered listeners.
 */
class GameWSClient {
    private ws: WebSocket | null = null;
    private url: string;
    private listeners: Set<MessageHandler> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private intentionalClose = false;

    constructor(url: string = DEFAULT_URL) {
        this.url = url;
    }

    /** Open the WebSocket connection. */
    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.intentionalClose = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("[WS] Connected to", this.url);
        };

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const msg: WSMessage = JSON.parse(event.data);
                this.listeners.forEach((handler) => handler(msg));
            } catch (err) {
                console.error("[WS] Failed to parse message:", err);
            }
        };

        this.ws.onclose = () => {
            console.log("[WS] Connection closed");
            if (!this.intentionalClose) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (err) => {
            console.error("[WS] Error:", err);
        };
    }

    /** Close the connection without auto-reconnect. */
    disconnect(): void {
        this.intentionalClose = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.ws?.close();
        this.ws = null;
    }

    /** Send a typed message to the server. */
    send(type: string, payload: Record<string, unknown> = {}): void {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            console.warn("[WS] Cannot send, not connected");
            return;
        }
        this.ws.send(JSON.stringify({ type, payload }));
    }

    /** Register a handler for incoming messages. */
    subscribe(handler: MessageHandler): () => void {
        this.listeners.add(handler);
        return () => {
            this.listeners.delete(handler);
        };
    }

    /** Whether the connection is currently open. */
    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            console.log("[WS] Attempting reconnect...");
            this.connect();
        }, 2000);
    }
}

/** Singleton instance shared across the application. */
const wsClient = new GameWSClient();

export default wsClient;