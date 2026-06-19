# Nota Digital — Product Blueprint

> Instant invoice & payment link generator for Indonesian merchants

---

## Product Concept

Merchant fills a form: buyer name, items, qty, prices. The app generates a shareable `/nota/[id]` link — a clean mobile invoice with a Midtrans payment button. Merchant pastes the link into WhatsApp. Buyer taps, sees the nota, pays. Merchant gets notified. Done.

---

## User Flow

```
Fill form → Get /nota/[id] link → Share to buyer via WhatsApp
    → Buyer opens link → Midtrans Snap popup → Payment confirmed
```

---

## File Structure

```
nota-digital/
├── app/
│   ├── page.tsx                  ← merchant form (create nota)
│   ├── nota/
│   │   └── [id]/
│   │       └── page.tsx          ← public invoice page (buyer view)
│   └── api/
│       ├── nota/
│       │   └── route.ts          ← POST: create nota, GET: fetch nota
│       └── xendit/
│           ├── token/
│           │   └── route.ts      ← POST: create Snap token
│           └── webhook/
│               └── route.ts      ← POST: payment notification handler
├── lib/
│   ├── db.ts                     ← Vercel KV or Supabase client
│   ├── xendit.ts               ← xendit server SDK wrapper
│   └── nanoid.ts                 ← short ID generator for /nota/[id]
├── components/
│   ├── InvoiceForm.tsx           ← item rows, buyer info, total calc
│   ├── InvoiceView.tsx           ← nota display (merchant + buyer)
│   └── PayButton.tsx             ← xendit Snap trigger (client)
└── .env.local
    ├── XENDIT_DEV_CALLBACK_TOKEN //syumra_callback_secret_token_123
    ├── XENDIT_DEV_API_KEY //xnd_development_qTp6k9ZcmMUq0jbnnvXdhN8TJ0z7s9vrTB3cFh3vpDiZrXbLXGjlnm9YnLR8C
    └── KV_URL (or SUPABASE_URL)
```

---

## API Routes

| Method | Path                  | Description                           |
| ------ | --------------------- | ------------------------------------- |
| `POST` | `/api/nota`           | Save nota to DB, return short ID      |
| `GET`  | `/api/nota?id=xxx`    | Fetch nota data for invoice page      |
| `POST` | `/api/xendit/token`   | Create xendit payment token from nota |
| `POST` | `/api/xendit/webhook` | Handle payment status, update nota    |

---

## Tech Stack

| Package               | Role                            |
| --------------------- | ------------------------------- |
| Next.js 14 App Router | Framework + API routes          |
| Vercel KV             | Nota storage (Redis, free tier) |
| xendit                | Payment popup (sandbox free)    |
| nanoid                | Short readable invoice IDs      |
| Tailwind CSS          | Styling, mobile-first           |
| Vercel                | Deploy in 1 command             |

---

## 48-Hour Build Timeline

| Time   | Task                                        |
| ------ | ------------------------------------------- |
| 0–2h   | Project setup & scaffold                    |
| 2–8h   | Merchant form + nota DB + `/nota/[id]` page |
| 8–14h  | xendit integration + webhook                |
| 14–16h | WhatsApp share button + copy link           |
| 16–18h | Polish UI + deploy to Vercel                |

---

## Key Implementation Decisions

### Storage

**Vercel KV (Redis)** is fastest to set up and free on hobby tier. If you already have a Supabase project, use that — the `invoices` table is one migration file.

### xendit Mode

Start in sandbox (`https://app.sandbox.xendit.com`), swap `XENDIT_IS_PRODUCTION=true` for the live demo. The server key format is `SB-Xendit-server-xxx` in sandbox vs `Xendit-server-xxx` in production.

### Nota ID Format

Use `nanoid(8)` — generates something like `nota/Xk3mP9qR`, short enough to paste into WhatsApp without wrapping.

---

## Why This Impresses

| Signal                   | Why it matters                                                                  |
| ------------------------ | ------------------------------------------------------------------------------- |
| Real payment integration | Not a mockup — xendit actually charges. Sandbox → production in one env switch. |
| Clear user insight       | Speaks to real UMKM pain — COD→transfer conversion gap is well-documented.      |
| Mobile-first UX          | Both the merchant form and buyer `/nota` page are phone-optimized.              |
| Live on a real URL       | Vercel deploy means the reviewer can actually try it, not just read about it.   |

---

## Next Steps

1. `npx create-next-app@latest nota-digital --typescript --tailwind --app`
2. Set up Vercel KV in the Vercel dashboard, copy env vars
3. Register xendit sandbox account at [sandbox.xendit.com](https://sandbox.xendit.com)
4. Build `InvoiceForm.tsx` → `POST /api/nota` → `/nota/[id]` page → `PayButton.tsx`
5. Wire `POST /api/xendit/token` and webhook
6. `vercel deploy`
