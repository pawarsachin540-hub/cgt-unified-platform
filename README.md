# CGT Unified Platform

An integrated **Cell & Gene Therapy lifecycle** application — one system of record spanning
R&D through GMP batch release. Built on the same stack you already use: **React + Vite + Supabase**,
deployable from **Termux → GitHub → Vercel**.

> **Scope note.** This is a real, working foundation — not a validated replacement for commercial
> suites (Benchling, Veeva, SAP, Maximo, LabVantage). It gives you a coherent data model, working
> CRUD across every lifecycle module, authentication, role-based access, and a database-enforced
> audit trail. Extend it module by module.

## Modules

| Lifecycle stage | Modules |
|---|---|
| Discovery & R&D | Projects, ELN Entries |
| Tech Transfer | Tech Transfer packages |
| Materials & Supply | Suppliers, Materials, Inventory/Store, Purchase Orders |
| Manufacturing | Batches (MBR/EBR reference) |
| Quality Control | Specifications, QC Results |
| Quality Assurance | Controlled Documents, Deviations, CAPA, Change Controls |
| Equipment & Facilities | Equipment Register, URS, Calibrations, Maintenance |
| Release | Batch Release |
| People | Training Courses, Training Records |
| Cross-cutting | Dashboard, Audit Trail |

## Architecture

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, lucide-react icons.
- **Backend:** Supabase (Postgres + Auth + Row Level Security).
- **Config-driven:** every module is defined once in `src/config/modules.js`. A generic
  `ResourcePage` renders the list, search, filters, and create/edit/delete forms.
  To add a module: add a config entry + a matching table in the SQL migration.
- **Audit trail:** a Postgres trigger (`audit_capture`) records every insert/update/delete
  on every table into an append-only `audit_log`. It cannot be bypassed from the app.
- **RBAC:** `profiles.role` (admin / manager / analyst / viewer). Read is open to any
  signed-in user; write requires analyst-or-above, enforced by RLS policies.

## Local setup

```bash
npm install
cp .env.example .env     # then fill in your Supabase URL + anon key
npm run dev
```

Open http://localhost:5173.

## Supabase setup

1. Create a project at supabase.com.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`.
3. (Optional) run `supabase/seed.sql` for demo data.
4. **Project Settings → API**: copy the Project URL and `anon` public key into `.env`.
5. Sign up in the app, then in the SQL editor promote yourself:
   `update public.profiles set role='admin' where email='you@example.com';`

## Deploy

`vercel.json` already rewrites all routes to `index.html` (SPA). Set the two
`VITE_SUPABASE_*` environment variables in Vercel. See `DEPLOY_TERMUX.md` for the
full mobile workflow.
