# VOID — End-to-End Encrypted Messaging

> *The presence of absence.*

VOID is a secure messaging application where the server **never sees plaintext**. All encryption and decryption happens exclusively on the client using the browser-native Web Crypto API.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │  UI/UX   │   │AuthContext│   │  lib/crypto.ts   │ │
│  │ (React)  │◄──│ (memory) │◄──│ (Web Crypto API) │ │
│  └──────────┘   └──────────┘   └──────────────────┘ │
│                      │                  │            │
│                 ┌────▼─────┐   ┌────────▼─────────┐ │
│                 │lib/api.ts│   │ lib/storage.ts   │ │
│                 │(REST)    │   │ (IndexedDB)      │ │
│                 └────┬─────┘   └──────────────────┘ │
│                      │                              │
│                 ┌────▼─────┐                        │
│                 │lib/socket│                        │
│                 │(WebSocket)│                        │
│                 └────┬─────┘                        │
└──────────────────────┼──────────────────────────────┘
                       │ HTTPS / WSS (ciphertext only)
┌──────────────────────▼──────────────────────────────┐
│              WhisperBox Backend (Server)             │
│                                                      │
│  • Stores encrypted blobs only                       │
│  • Never receives or stores plaintext                │
│  • Manages user identities + key material storage    │
│  • Handles JWT authentication                        │
│  • Forwards encrypted messages via WebSocket         │
└─────────────────────────────────────────────────────┘
```

---

## Encryption Scheme

VOID uses a **hybrid encryption scheme** combining RSA-OAEP and AES-GCM.

### Key Generation (on Register)

```
Password + Random Salt
        │
        ▼ PBKDF2 (310,000 iterations, SHA-256)
   AES-KW Key (256-bit)
        │
        ▼ wrapKey()
RSA-OAEP Key Pair (2048-bit)
   │              │
   │              ▼ AES-KW wrap
   │         Wrapped Private Key ──► stored on server
   │
   ▼ exportKey(spki)
Public Key (base64) ──────────────► stored on server

Private Key (CryptoKey) ──────────► stored in IndexedDB
```

### Sending a Message

```
Plaintext
    │
    ▼ AES-GCM 256-bit (fresh key + random IV per message)
Ciphertext
    │
    ├── AES Key ──► RSA-OAEP(Recipient Public Key) ──► encryptedKey
    └── AES Key ──► RSA-OAEP(My Public Key) ─────────► encryptedKeyForSelf

Server stores: { ciphertext, iv, encryptedKey, encryptedKeyForSelf }
Server cannot decrypt any of these fields.
```

### Receiving a Message

```
encryptedKey ──► RSA-OAEP decrypt (My Private Key) ──► AES Key
AES Key + iv ──► AES-GCM decrypt ──► Plaintext
```

---

## Security Decisions

| Decision | Rationale |
|---|---|
| RSA-OAEP 2048-bit | Asymmetric key exchange, required by WhisperBox API |
| AES-GCM 256-bit | Authenticated encryption with post-quantum margin |
| Fresh AES key per message | Limits blast radius of any single key compromise |
| PBKDF2 310,000 iterations | OWASP 2023 minimum — slows password brute-force |
| Private key in IndexedDB | CryptoKey stored as structured clone, never serialised |
| Tokens in memory only | Prevents XSS token theft via localStorage |
| encryptedKeyForSelf | Allows sender to decrypt their own sent messages |

---

## Known Limitations

**Forward Secrecy** — RSA-OAEP does not provide true forward secrecy. If a private key is compromised, past messages could be decrypted. Signal Protocol's double ratchet would solve this but is outside the scope of the WhisperBox API scheme. Each message uses a fresh AES key as a partial mitigation.

**Key Recovery** — Lost password = lost message history. The server cannot help recover keys by design.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Crypto | Web Crypto API (zero external crypto libraries) |
| Key Storage | IndexedDB |
| Real-time | WebSocket (wss://) |
| Backend | WhisperBox API |

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — redirects to /login.

No .env needed. The WhisperBox API is public at https://whisperbox.koyeb.app.