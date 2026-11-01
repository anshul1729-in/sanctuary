# Sanctuary — Engineering & CS Reflection Journal

> **"A high-performance personal engineering knowledge base and daily reflection system built with React, Supabase PostgreSQL, and TipTap ProseMirror."**

Sanctuary is a specialized developer journal designed to capture daily engineering insights, systems design patterns, algorithm trade-offs, and architecture decisions. Built with an offline-first **dual-storage architecture**, it provides instant local editing with resilient cloud synchronization and multi-tenant database security.

---

## 🌟 Key Engineering Features

- **Dual-Storage Persistence:** Zero-latency optimistic local caching (`localStorage`) seamlessly synchronized with a managed **Supabase PostgreSQL** cloud backend. Works completely offline with automatic cloud reconciliation when connectivity is restored.
- **Strict Multi-Tenant Security (PostgreSQL RLS):** Database tables (`sections`, `entries`) enforce strict Row Level Security policies (`auth.uid() = user_id`) paired with authenticated JWT sessions, guaranteeing complete user data isolation.
- **TipTap ProseMirror Rich-Text Engine:** Distraction-free Markdown & rich-text editing experience featuring code blocks, callouts, real-time word/character counts, and debounced auto-saving (800ms) to eliminate accidental data loss.
- **GitHub-Style Contribution Heatmap:** 16-week interactive activity matrix tracking daily engineering reflections and topic streaks across categories (Systems, DSA, Operating Systems, Networking, Databases).
- **Curated Categorization & Metadata:** Entries track time/space complexity annotations, reading time estimates, subtopics, tags, and key takeaways.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React 18 Client                      │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │   TipTap Editor       │  │  Contribution Heatmap │  │
│  │  (Debounced AutoSave) │  │  (16-Week Activity)   │  │
│  └───────────┬───────────┘  └───────────────────────┘  │
└──────────────┼─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│            Dual-Storage Sync Pipeline                  │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │  localStorage Cache    │  │  Supabase Client     │  │
│  │  (Instant Zero-Latency)│  │  (Async Cloud Sync)  │  │
│  └────────────────────────┘  └──────────┬───────────┘  │
└─────────────────────────────────────────┼──────────────┘
                                          │
                                          ▼ (JWT Bearer)
┌────────────────────────────────────────────────────────┐
│             Supabase PostgreSQL 15                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Row Level Security (RLS): auth.uid() = user_id  │  │
│  ├────────────────────────┬─────────────────────────┤  │
│  │  public.sections       │  public.entries         │  │
│  └────────────────────────┴─────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Tailwind CSS, Framer Motion, Lucide Icons, Vite
- **Editor:** TipTap (ProseMirror core), StarterKit, Placeholder
- **Backend & Database:** Supabase (PostgreSQL 15), Supabase Auth (JWT), Row Level Security (RLS)
- **Deployment:** Vercel

---

## 📂 Project Structure

```text
sanctuary/
├── src/
│   ├── components/       # Rich-text editor, heatmap, sidebar, modals
│   ├── context/          # Journal state management & sync engine
│   ├── lib/              # Supabase client & local storage adapters
│   ├── views/            # Entry view, section overview, analytics
│   ├── App.jsx           # Application entry point
│   └── index.css         # Typography & custom themes
├── supabase/
│   └── migrations/       # SQL schemas and strict RLS security policies
├── .env.example          # Environment variable template
├── tailwind.config.js    # Design system configuration
└── vite.config.js        # Build tool configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (or local Supabase CLI)

### 1. Clone & Install
```bash
git clone https://github.com/anshul1729-in/sanctuary.git
cd sanctuary
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security
All database queries are guarded by Supabase Row Level Security (RLS). Even with a public anonymous client key, users can only read, insert, update, or delete records where `user_id == auth.uid()`.
