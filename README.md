# Sushi Order — CSE 310 Mobile App Module

A mobile ordering app for a sushi restaurant, built with **React Native + Expo (SDK 57) + TypeScript** for Android and iOS.
Customers browse a menu shared across branches, customize items with options, build a cart, and send the order to the
nearest branch as a **pre-filled WhatsApp message**. WhatsApp is the restaurant's real ordering channel, so orders are
never stored on a server and there are no accounts.

> The catalog in this repo (`src/data/catalog.json`) is **sample data**: made-up branches, prices and WhatsApp numbers.

## How the module requirements are met

| Requirement | Where |
| --- | --- |
| Multiple screens with navigation | Expo Router (built on React Navigation's native stack): Menu, Product Detail, Cart, Order Summary, plus a Branch Picker modal (`src/app/`) |
| User interaction | Option selectors (radio / checkbox with max), quantity steppers, name + notes fields (`src/components/`, `src/app/summary.tsx`) |
| Structured local data | JSON catalog with branches, categories, products, option groups and per-branch availability, typed in `src/types/catalog.ts` |
| On-device storage | Cart, branch, name and notes persist across restarts with AsyncStorage (`src/state/CartContext.tsx`) |
| Device features | Location permission + haversine distance to auto-pick the nearest branch (`src/state/LocationContext.tsx`, `src/lib/distance.ts`); deep link into WhatsApp (`src/lib/whatsapp.ts`); clipboard fallback |
| State management | Cart state via React Context + `useReducer` (`src/state/cartReducer.ts`) |
| Unit tests | Totals, reducer, pricing, distance and message building (`src/**/__tests__/`) |

## Features

- **Nearest branch**: on first launch the app asks for location and selects the closest branch. If permission is denied,
  the menu prompts you to pick one manually (with a shortcut to Settings).
- **Per-branch menu**: only products the selected branch carries are shown.
- **Product options**: single-choice groups (size, protein…) and multi-choice groups with a limit (extras, toppings),
  each with its own price change. The Add button shows the live total.
- **Cart**: identical items merge; quantities and removal; subtotal.
- **Branch switching**: if the new branch doesn't carry some cart items, the app lists them and asks before removing them.
  Items that become unavailable any other way are flagged in the cart and left out of the total and the message.
- **WhatsApp order**: builds a formatted message (items, options, total, name, notes) and opens `wa.me/<branch>` with it
  pre-filled. **Copy order text** is always available in case WhatsApp can't be opened.
- Light and dark mode.

## Running it

Requirements: Node 20+, and the **Expo Go** app on your phone (or an iOS Simulator / Android emulator).

```bash
npm install
npx expo start        # scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

- WhatsApp isn't available on simulators: there the link opens the wa.me web page. Test the send flow on a real phone.
- To test location on the iOS Simulator: `xcrun simctl location booted set 40.2338,-111.6585` (near the Provo branch).

### Scripts

```bash
npm test              # unit tests (Jest, jest-expo preset)
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
npm run format        # prettier
```

## Project structure

```
src/
  app/                  # screens (Expo Router: every file is a route)
    _layout.tsx         # stack navigator + Cart/Location providers
    index.tsx           # Menu
    product/[id].tsx    # Product detail
    cart.tsx            # Cart
    summary.tsx         # Order summary + WhatsApp
    branch.tsx          # Branch picker (modal)
  components/           # Button, QuantityStepper, OptionGroupPicker, BranchBar, CartBar
  data/catalog.json     # sample catalog
  lib/                  # pure logic: catalog lookups, pricing, distance, WhatsApp message
  state/                # cartReducer (pure), CartContext (AsyncStorage), LocationContext
  types/catalog.ts
  theme.ts              # color, spacing, radius, type tokens
```

Money is stored as **integer cents** everywhere to avoid floating-point rounding. Cart lines store only product ids and
selected option ids; names and prices are looked up from the catalog, so a catalog update is picked up by saved carts.

## Out of scope (this sprint)

- Admin panel for editing the menu
- Delivery-cost calculation
- Payments
- User accounts

## Later list

Ideas that came up during the sprint go here instead of into the code:

- Product photos instead of emoji
- Opening-hours check (warn when the branch is closed)
- Remote catalog loaded from the admin panel
