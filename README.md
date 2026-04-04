# PinkTech

**Discover women shaping today's technology.**

PinkTech is the definitive directory of inspiring leaders, innovators, and experts across the tech industry. Create your public profile, get discovered by peers and employers, and explore the women driving today's technology.

## Features

### Home

Browse featured leaders and search the directory from the homepage.

![PinkTech home with search bar and featured leaders](docs/images/home.png)

### Search

Filter profiles by name, expertise, company, and more to find exactly who you're looking for.

![PinkTech search with list of profiles](docs/images/search.png)

### Profile

View a leader's full biography, expertise, and social links.

![PinkTech profile with user's information and biography](docs/images/profile.png)

### My Profile

Create and edit your own public profile — control how you're represented in the directory.

![PinkTech current user's profile with edit forms](docs/images/my-profile.png)

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | React 19 + TypeScript              |
| Build tool | Vite with SWC                      |
| Styling    | Tailwind CSS v4                    |
| Routing    | React Router v7                    |
| Backend    | Supabase (auth, database, storage) |
| Animations | Framer Motion                      |
| Icons      | Lucide React                       |

## Project Structure

Source code is organized by **feature** (`src/features/`) and **shared** code (`src/shared/`). Features own their screens (`pages/`) and feature-specific UI (`components/` and subfolders). Shared holds the app shell, Supabase client, global hooks, design-system-style UI primitives, and utilities used across features.

```
pink-tech/
├── public/                 # Static assets (favicon, Open Graph image, etc.)
├── docs/                   # Documentation assets (e.g. README screenshots)
├── supabase/
│   └── functions/
│       └── delete-account/ # Edge function: deletes auth user and related profile data
├── src/
│   ├── App.tsx             # Route table; wraps routes in the shared layout
│   ├── main.tsx            # React root and DOM mount
│   ├── pages/
│   │   └── main/
│   │       └── Home.tsx    # Homepage route (hero, search entry, featured profiles)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/      # Login, sign-up, email verification
│   │   │   └── components/ # Forms, GuestRoute / ProtectedRoute, verification notice
│   │   ├── profile/
│   │   │   ├── detail/     # Public profile page and inline editing UI
│   │   │   ├── featured/   # Featured leaders on the homepage
│   │   │   └── settings/   # Account settings and delete-account flow
│   │   └── search/
│   │       ├── pages/      # Full search experience
│   │       ├── components/ # Search bar, list, cards, counts
│   │       ├── filters/    # Filter UI and active-filter chips
│   │       ├── responsive/ # Desktop vs mobile search and filter layouts
│   │       └── results/    # Filtered list, empty states, not-found handling
│   ├── shared/
│   │   ├── components/     # Layout, header, footer, hero, CTA, navigation
│   │   ├── config/         # Supabase client setup
│   │   ├── contexts/       # Auth state and session helpers
│   │   ├── hooks/          # Data hooks (e.g. profiles from Supabase)
│   │   ├── styles/         # Global styles and Tailwind entry
│   │   ├── types/          # Shared TypeScript types (e.g. user profile shape)
│   │   ├── ui/             # Reusable UI: display, feedback, forms, toasts
│   │   └── utils/          # Validators, storage helpers, DB field mapping tests
│   └── test/               # Test harness setup (e.g. Vitest)
├── index.html
├── vite.config.ts          # Vite + SWC
├── vercel.json             # Hosting: SPA fallback rewrites for client-side routing
├── eslint.config.js
├── tsconfig.json           # Plus tsconfig.app.json, tsconfig.node.json
└── package.json
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```
