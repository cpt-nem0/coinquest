# Coinquest — v1 Build Spec (v2)

Status: draft for review · Owner: Rohan · Date: 2026-07-12
Companion docs: [`DESIGN.md`](./DESIGN.md) · [`designs/README.md`](./designs/README.md)
Changed in v2: **iOS-first**, **React Native (cross-platform)**, **email + manual ingestion** (SMS is an Android-only source added later).

---

## 1. What v1 is (and isn't)

**Coinquest v1** is a gamified personal-finance app that turns your real spending into a neo-brutalist RPG: money has health, categories are boss battles, good habits earn XP and coins. Built **cross-platform in React Native**, shipping **iOS first** (that's the test device), with Android as a fast-follow.

**Prime directive (design):** the finance is the product; the game is the skin. Real amounts and real merchants are always the loudest thing on screen.

### In scope (v1, iOS)
- iOS phone, portrait, **light theme only** (dark = "coming soon").
- **Ingestion: email receipts (Gmail) + manual add / share-sheet.** Source pipeline is provider-agnostic so more sources plug in later.
- On-device, rule-based parsing + categorization. No LLM.
- Core loop: Ledger, Home (Money Health + budget), Battles (bosses vs 3-month median), Boss detail, Encounter (review a spend), Hero.
- Supporting: Onboarding, Bills, Savings goals, Settings (currency switcher), Level-up modal.
- Real currency default (₹), Coins = reward points only.

### Out of scope (v1 — roadmap, in order)
1. **Android build** → unlocks the **SMS auto-capture** superpower (see §4.4).
2. **Account Aggregator (RBI AA)** integration → real bank transaction feed (needs FIU onboarding).
3. Cloud sync/backup, Shop/cosmetics, social, iOS dark theme.

### Success criteria (v1)
- ≥ 90% correct parse of supported email receipt formats (amount, merchant, direction).
- No financial data leaves the device.
- New user → populated Ledger/Home within ~2 min of connecting Gmail.
- Gamification never mislabels a healthy state as bad; never creates guaranteed-loss streaks.

---

## 2. Platform & stack (confirmed)

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **React Native + Expo (dev client)** | One codebase → iOS now, Android later. Expo = fast iOS iteration; dev client allows native modules (SMS on Android later). |
| **Language** | TypeScript | |
| **Custom UI / pixel rendering** | **@shopify/react-native-skia** + RN views | Skia draws the segmented HP/XP bars, hard-shadow pixel panels, and sprites pixel-perfectly and identically on both OSes. |
| **State** | Zustand | Small, testable; engines are derived selectors over the store. |
| **Local DB** | **op-sqlite (SQLite) + Drizzle ORM**, encrypted (SQLCipher) | Fast on-device store, typed queries, migrations. |
| **Secure storage** | expo-secure-store (Keychain) | OAuth tokens, encryption keys. |
| **Email** | **IMAP + Gmail app-password** (read-only, on-device) | Sidesteps Google's restricted-scope OAuth **verification/CASA cost** entirely; fully client-side; free. Needs 2FA + an app-password. |
| **On-device LLM (optional)** | **Apple Foundation Models** (iOS 26+) | Free, private, on-device. Parser fallback + merchant categorization + RPG flavor text. Degrades gracefully where unavailable; Android → Gemini Nano later. |
| **Backend** | **None — client-only, $0** | No hosted DB/API. If ever needed (Account Aggregator webhooks later), a free serverless tier (Cloudflare Workers) is free at 1–2 users. |
| **Fonts** | Space Grotesk (UI) + JetBrains Mono (all money/numbers) | Per `DESIGN.md`. |

---

## 3. Architecture (on-device, source-agnostic)

```
 SOURCES (adapters)        CAPTURE           DOMAIN (pure engines)      UI (React Native + Skia)
 ┌────────────────────┐  RawMessage  ┌────────────┐  Transaction ┌───────────────┐   ┌─────────────┐
 │ GmailSource (v1)   │ ───────────▶ │ Parser     │ ───────────▶ │ Ledger store  │──▶│ 13 screens  │
 │ ManualSource (v1)  │              │ (rules +   │              │ Budget/Bills  │   │ Skia widget │
 │ ShareSource (v1)   │              │ merchant   │              │ Boss engine   │   │ kit         │
 │ SmsSource (Android)│ ─ later ───▶ │ dict +     │              │ Health score  │   └─────────────┘
 │ AASource (roadmap) │ ─ later ───▶ │ user rules)│              │ XP/Level/Coins│
 └────────────────────┘              └────────────┘              │ Quests/Streak │
                                                                  └───────────────┘
                       everything local · SQLite (encrypted)
```

The key design choice: **every source implements one interface** (`Source → RawMessage[]`). The Parser and everything downstream never know or care where a message came from. Adding SMS (Android) or Account Aggregator later is a **new adapter, zero changes to the parser, engines, or UI.**

```ts
interface Source {
  id: 'gmail' | 'manual' | 'share' | 'sms' | 'aa';
  isAvailable(): boolean;           // platform/permission gated
  pull(since: Date): Promise<RawMessage[]>;
}
interface RawMessage { id: string; source: Source['id']; sender: string; body: string; ts: number; rawHash: string; }
```

---

## 4. Ingestion & parsing

### 4.1 Email (IMAP) — primary v1 source
- Connect via **IMAP with a Gmail app-password** (needs 2FA on the account). No OAuth, no Google verification, **no cost**. Credentials stored in Keychain (expo-secure-store).
- Read-only: fetch messages from known financial senders (banks, cards, UPI apps, merchant receipts); hand bodies to the parser. **All on device.**
- RN implementation: TLS socket (`react-native-tcp-socket`) + a lightweight IMAP client; incremental by UID.
- (Gmail API OAuth stays a post-launch option if we want a smoother connect UX and are willing to complete Google's restricted-scope verification.)

### 4.2 Manual & Share
- **Manual add:** a quick form (amount, merchant, category, date) — always available, offline.
- **Share-sheet extension:** share a receipt/screenshot/text into Coinquest → parser attempts extraction, user confirms in the Encounter flow.

### 4.3 Parser (rule-based, on-device)
- Sender/template registry (regex) → `amount`, `direction`, `accountTail`, `merchantRaw`, `datetime`, `refId`.
- Merchant normalization via bundled dictionary + fuzzy match; unknown kept verbatim.
- Categorization: merchant→category map with confidence; low confidence → "needs review" surfaced in **Encounter**.
- **Sticky user corrections:** correcting a category writes a local rule that wins next time (learning without ML).
- Amounts = integer minor units + ISO currency. Never floats.

### 4.4 "What we can do about SMS" (the honest plan)
SMS is the richest signal in India — but **iOS cannot read SMS or notifications** (hard OS sandbox; no API, and Shortcuts automations can't reliably forward message bodies in the background). So:

1. **Architecture is ready today.** `SmsSource` is just another `Source` adapter. Nothing else changes when it arrives.
2. **Android fast-follow = the real unlock.** On the Android build, a native SMS module (`READ_SMS`/notification listener) feeds the **same parser** — instant, comprehensive capture. This is where the "auto-tracks from your messages" magic actually lives. (Ship with a Play permissions declaration / notification-listener approach.)
3. **Optional iOS bridge for power users:** forward bank SMS to a dedicated email (via an Android second phone, carrier rule, or a small forwarder), which `GmailSource` then ingests through the exact same pipeline. Documented as advanced/opt-in, not the default.
4. **Account Aggregator (roadmap):** the sanctioned iOS-friendly way to get *real* bank transactions without SMS — added as `AASource` once FIU onboarding is done.

Net: v1 (iOS) captures via **email + manual/share**; SMS capture is designed-in and switches on with the Android release.

### 4.5 On-device LLM (optional enhancement, iOS 26+)
The rule-based parser stays **PRIMARY** (deterministic, free, works on every device). Where available, **Apple Foundation Models** (on-device, free, private — no API cost, nothing leaves the phone) enhances it:
- **Parser fallback:** extract amount/merchant/direction from receipt formats we have *no template for* → boosts coverage without hand-writing every bank's rules.
- **Merchant categorization:** classify unknown merchants into categories (user corrections still win).
- **Flavor text:** generate playful boss taunts / quest lines / "worth it?" quips — cheap delight at $0.
- **NL insights** (later): "where did my money go this month?"

Constraints: needs **iOS 26 + an Apple-Intelligence device** (iPhone 15 Pro / A17 Pro & up). Called from React Native via a small **Swift native module** (uses `@Generable` for typed/structured output + tool calling). Everything **degrades gracefully to rules-only** when unavailable — never a hard dependency, so it can't break older devices or bloat cost. Android equivalent later = **Gemini Nano / ML Kit GenAI**. (This is why Fable's "no LLM" caution doesn't apply here — that was about *cloud* LLMs and their cost/privacy; on-device is free and private.)

### 4.6 Currency
- One real currency per user (default `INR`), set in onboarding, changeable in Settings — a display setting; stored amounts carry their own currency code.
- **Coins** = separate integer counter, never money, shown only with the gold ✦ coin.

---

## 5. Data model (SQLite / Drizzle)
```
User(id, heroName, avatarId, currency, monthlyBudgetMinor, createdAt)
Source(id, kind, status, lastSyncAt)                              -- gmail|manual|share|sms|aa
Account(id, bankName, accountTail, type)
Transaction(id, accountId, amountMinor, currency, direction, merchant, merchantRaw,
            categoryId, ts, sourceKind, refId, status)            -- status: confirmed|needs_review
Category(id, name, flavorName, icon, isFixedBill)
CategoryRule(id, matchType, matchValue, categoryId)
Budget(id, month, categoryId?, amountMinor)
Bill(id, name, amountMinor, dueDay, cadence, status, autopay)
Goal(id, name, targetMinor, savedMinor, icon, status)
Boss(categoryId, month, spentMinor, medianMinor, state)
Quest(id, type, title, rewardCoins, xp, period, state)
PlayerState(level, xp, coinsBalance, streakDays, moneyHealth, updatedAt)
Badge(id, name, icon, earnedAt?)
```

---

## 6. Domain engines (must be correct)
- **Boss engine:** target = **rolling 3-month median** per category; **fixed bills excluded**; states `winning` / `ahead` (calm amber) — **never** "defeated"; `< 3 months` data → "scouting" state.
- **Money Health (0–100):** transparent weighted score — budget adherence 40%, savings rate 25%, bills-on-time 20%, trend-vs-median 15%. Rendered **green**; low = amber, never mocking red; always shown beside the real spend figure.
- **XP/Level/Coins:** XP **only** from restraint/planning (under-median month, planning quest, no-spend day, weekly review, goal hit) — never from logging. Level curve `500 + 250·(n-1)`. Coins = cosmetic soft currency, decoupled from money.
- **Quests & streaks:** small rotating restraint/planning set; streak breaks gracefully.

---

## 7. Screens → features (13)
Same mapping as the designs (`designs/README.md`): 01 Welcome · 02 Connect (Gmail/manual, **not** SMS on iOS) · 03 Create Hero (avatar/currency/budget) · 04 Home · 05 Battles · 06 Boss detail · 07 Bills · 08 Ledger · 09 Encounter · 10 Hero · 11 Savings Nest · 12 Settings (currency switcher, Light theme) · 13 Level-up modal. Assets in `designs/assets/`.
> Onboarding copy changes for iOS: "Connect Gmail to auto-import receipts" + "Add manually / share to Coinquest" — SMS auto-capture is presented as "coming to Android."

## 8. Privacy & security
On-device only; SQLite encrypted (SQLCipher); Gmail read-only, tokens in Keychain; fetch + parse on device; export + wipe in Settings. No financial content in analytics.

## 9. Build phases
- **P0 — Scaffold & UI kit.** Expo + TS, Drizzle schema, Skia neo-brutalist widget kit (bordered card, hard-shadow button, segmented bar, chip, tab bar), fonts, `DESIGN.md` tokens.
- **P1 — Ingestion + Parser + Ledger.** `Source` interface, `GmailSource` (OAuth PKCE) + `ManualSource`, parser for top Indian email receipt formats, merchant dict, Ledger with real data. *(Riskiest → build first, against a real receipt corpus.)*
- **P2 — Money core.** Budgets, categories, Home (real spend + Money Health), Bills.
- **P3 — Game core.** Boss engine, Battles + Boss detail, XP/Level/Coins, Quests/Streak, Hero, Encounter, Level-up.
- **P4 — Supporting.** Savings goals, Settings (currency switcher), Onboarding end-to-end.
- **P5 — Polish & TestFlight.** Sprites, empty/error states, share extension, iOS TestFlight beta.
- **P6 (fast-follow) — Android + `SmsSource`.** The SMS superpower.

## 10. Open decisions (need sign-off)
1. **Receipt corpus:** can you gather sample transaction *emails* (bank/UPI/merchant) to build & test parser templates?
2. Expo **managed + dev client** (recommended) vs bare RN?
3. **On-device LLM in v1:** wire up Apple Foundation Models now (device-gated, graceful fallback), or ship rules-only first and add it in a later pass?

Resolved: client-only / no backend ($0); email via **IMAP + app-password** (no OAuth verification cost).

## 11. Top risks
1. **Email coverage < SMS** — some txns don't email → lean on manual/share for v1; SMS (Android) closes the gap.
2. **Parser accuracy** — needs a real email corpus + "needs review" safety net.
3. **iOS auto-capture is inherently weaker** — set expectations in onboarding; Android is where auto-capture shines.
4. **Retention past novelty** — keep finance legible; seasons/endgame post-v1.
