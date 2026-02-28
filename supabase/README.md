# StarYaar – Supabase setup

## 1. Create project and get keys

1. Create a project at [supabase.com](https://supabase.com).
2. In **Settings → API**: copy **Project URL** and **anon public** key.
3. In the app root, copy `.env.example` to `.env` and set:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

## 2. Run migrations

Apply the panchang table migration:

- **Supabase CLI**: `npx supabase db push` (or `supabase migration up`).
- **Dashboard**: **SQL Editor** → paste and run the contents of `migrations/20250227000001_create_panchang.sql`.

## 3. Seed panchang (1970–2040)

Uses [@fusionstrings/panchangam](https://www.npmjs.com/package/@fusionstrings/panchangam) (Swiss Ephemeris) with **Delhi** as reference location.

```bash
npm run db:seed-panchang
```

- Reads `.env` for `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` if RLS blocks anon).
- Generates one row per day from **1970-01-01** to **2040-12-31** (~26k rows). May take several minutes.
- Uses `upsert` on `date`, so re-running is safe.

## Tables

| Table     | Purpose |
|----------|---------|
| `panchang` | Daily panchang (tithi, nakshatra, yoga, karana, vara, lagna at sunrise) for Delhi; 1970–2040. |
