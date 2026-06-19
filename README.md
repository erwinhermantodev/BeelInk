# BeelInk — Instant Digital Invoice Generator

A sleek, Neo-Brutalist digital invoice generator designed for modern chat commerce.

---

### 🐝 What it is & How to run it
**BeelInk** is a fast, web-based invoice generator integrated with Xendit payments and real-time inventory management.
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

### 👤 Who it's for & Its one job
- **Who it's for:** Indonesian MSMEs, social sellers, and chat-commerce merchants.
- **The one job it must do well:** Let a seller generate a payment-linked customer invoice in under 30 seconds.

---

### 💡 Why this problem & Why it's worth solving
- **Why this problem:** Chat-based sellers lose hours manually checking bank receipts, verifying payments, and updating product stock levels.
- **How we know it's worth solving:** Automation prevents manual audit errors, reduces transaction drop-off, and scales sales velocity without adding admin overhead.

---

### ⚔️ What's already out there & Why we built this anyway
- **What's out there:** Bloated, expensive ERP systems and formal accounting platforms that require extensive onboarding.
- **Why we built this:** To offer a zero-friction, mobile-friendly creator tool with a distinct, beautiful Neo-Brutalist aesthetic that matches modern brand identities.

---

### 🔭 Scope (In vs. Out) & Rationale
- **In-Scope:** Immediate registration/login, inventory stock control, multi-item creation via the [InvoiceForm.tsx](file:///Users/Project/tokvio/digital-invoice/components/InvoiceForm.tsx) dropdown picker, public client view at [InvoiceView.tsx](file:///Users/Project/tokvio/digital-invoice/components/InvoiceView.tsx), and automated stock deduction via [app/api/xendit/webhook/route.ts](file:///Users/Project/tokvio/digital-invoice/app/api/xendit/webhook/route.ts).
- **Out-of-Scope:** Advanced ledger accounting, tax structures, shipping label printing, and multi-currency transactions.
- **Rationale:** Keeps the user interface lightweight, fast, and optimized for speed and simplicity.

---

### ❔ Unknowns & Assumptions
- **Where we didn't have answers:** The specific messaging channels used (WhatsApp, Line, Instagram) and the exact shipping provider workflows.
- **What we assumed:** Sellers send invoice links directly via chat, and buyers prefer paying with Indonesian local payment methods (eWallet, QRIS, Virtual Accounts).

---

### 💬 Three questions for a real user
1. How do you currently send payment links and verify transfer screenshots from your customers?
2. What payment methods (e.g. QRIS, OVO/GoPay, ShopeePay, Bank Transfer) do your customers request most?
3. How do you track product inventory levels, and how often do you experience overselling or stock mismatch?

---

### 📈 How we know it's working & What's next
- **How we know it's working:** Full integration is verified through passing Playwright E2E testing scenarios that handle account registration, stock checks, invoice generation, webhook settlement simulation, and session security.
- **What we'd do next:**
  1. Add native QRIS support on the invoice view screen.
  2. Implement WhatsApp notification templates so sellers can send invoices directly via a pre-filled link.
  3. Build a simple monthly sales report widget on the dashboard.

---

### 🤖 AI Usage & Reflection
- **Where it helped:** The AI was highly effective at rapidly generating full-scope Playwright automated E2E test scripts, building database access patterns, styling the interface using CSS custom tokens, and compiling comprehensive walkthrough logs.
- **Where it got something wrong:** In the initial E2E script attempt, the AI tried to click directly on options inside the product picker dropdown using generic `.click()` calls. Playwright failed because `<select>` elements require the `.selectOption()` API. This was caught and corrected by rewriting the selector sequence to explicitly target and select options via values.

