# Neo-Brutalist UI Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the visual appearance of the "Nota Digital" application to match a Neo-Brutalist ("brutalist design") aesthetic, characterized by high-contrast black borders, flat drop shadows, uppercase bold typography, and flat primary colors.

**Architecture:** We will define modular Neo-Brutalist design tokens in `app/globals.css` (e.g. `.brutalist-card`, `.brutalist-input`, `.brutalist-btn`) and apply them across our Next.js components to ensure consistent design and clean markup.

**Tech Stack:** Next.js 16+, Tailwind CSS v4, PostgreSQL

---

### Task 1: Update Global Styles (`globals.css`)

**Files:**
- Modify: `app/globals.css`

**Step 1: Write minimal implementation**
Modify `app/globals.css` to add the Neo-Brutalist utility classes and customize the body background color to flat grey (`#bcbcbc`):
```css
@import "tailwindcss";

:root {
  --background: #bcbcbc;
  --foreground: #000000;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-weight: bold;
}

/* Neo-Brutalist Classes */
.brutalist-card {
  background-color: #ffffff;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px 0px #000000;
}

.brutalist-input {
  background-color: #ffffff;
  border: 3px solid #000000;
  color: #000000;
  font-weight: 700;
  outline: none;
  transition: all 0.1s ease;
}

.brutalist-input:focus {
  box-shadow: 3px 3px 0px 0px #000000;
}

.brutalist-btn-black {
  background-color: #000000;
  color: #ffffff;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
  font-weight: 800;
  text-transform: uppercase;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  cursor: pointer;
}

.brutalist-btn-black:active {
  transform: translate(3px, 3px);
  box-shadow: 1px 1px 0px 0px #000000;
}

.brutalist-btn-emerald {
  background-color: #10b981;
  color: #000000;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
  font-weight: 800;
  text-transform: uppercase;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  cursor: pointer;
}

.brutalist-btn-emerald:active {
  transform: translate(3px, 3px);
  box-shadow: 1px 1px 0px 0px #000000;
}

.brutalist-btn-cyan {
  background-color: #22d3ee;
  color: #000000;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
  font-weight: 800;
  text-transform: uppercase;
  transition: transform 0.05s ease, box-shadow 0.05s ease;
  cursor: pointer;
}

.brutalist-btn-cyan:active {
  transform: translate(3px, 3px);
  box-shadow: 1px 1px 0px 0px #000000;
}
```

**Step 2: Run verify command**
Run: `npm run build`
Expected: PASS

---

### Task 2: Update Merchant Form Component (`InvoiceForm.tsx`)

**Files:**
- Modify: `components/InvoiceForm.tsx`

**Step 1: Write minimal implementation**
Refactor the markup of `components/InvoiceForm.tsx` to replace Vercel style gradient cards/inputs with the newly created `.brutalist-card`, `.brutalist-input`, and `.brutalist-btn-*` classes. 

- Form Card: Change `bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl` to `brutalist-card p-8 text-black max-w-2xl mx-auto`.
- Headings: Capitalized text, heavy black weights, uppercase.
- Inputs: Apply `brutalist-input` and change border sizes.
- Delete/Add Item: Refactor buttons to look like small brutalist pressable blocks.
- Grand Total Banner: Black thick border divider.
- Submit Button: Use `brutalist-btn-cyan` for dynamic active pressing effect.
- Success View: Brutalist card with copying input field and emerald share buttons.

**Step 2: Run tests to verify logic**
Run: `npx vitest run __tests__/components/InvoiceForm.test.tsx`
Expected: PASS

---

### Task 3: Update Public Invoice Page & Pay Button

**Files:**
- Modify: `components/InvoiceView.tsx`
- Modify: `components/PayButton.tsx`

**Step 1: Write minimal implementation**
- **InvoiceView**: Apply `brutalist-card text-black` to the layout. Refactor status badges to use solid background blocks (amber/emerald/red) with thick black borders instead of blurry semi-transparent pill boxes.
- **PayButton**: Apply `.brutalist-btn-emerald` to the checkout redirect button.

**Step 2: Run tests to verify rendering**
Run: `npx vitest run __tests__/components/InvoiceView.test.tsx`
Expected: PASS

---

### Task 4: Final Validation and Build Check

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write minimal implementation**
Ensure `app/page.tsx` has a clean title element in bold capitalized text:
```typescript
<h1 className="text-5xl font-black tracking-tight text-black uppercase mb-2">
  Nota Digital
</h1>
```

**Step 2: Run all tests & build production package**
Run: `npm run test`
Expected: PASS
Run: `npm run build`
Expected: PASS

## Verification Plan

### Automated Tests
- Run `npm run test` to verify all components still render and submit correctly.

### Manual Verification
- Start Next.js development server: `npm run dev`
- Launch a browser to check that:
  - Cards have flat black borders (`border: 4px solid #000`) and flat block offsets (`box-shadow: 6px 6px 0px 0px #000`).
  - Inputs have a distinct 3px outline.
  - Buttons translate down `translate(3px, 3px)` on mouse press.
  - The background is a flat grey `#bcbcbc`.
