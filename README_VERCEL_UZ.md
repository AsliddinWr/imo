# imo repo — Vercel fix

Bu zip ichidagi fayllar faqat Vercel deploy uchun kerakli root config fayllaridir. Dizayn, sahifalar va app logic o'zgartirilmagan.

## 1) Fayllarni qo'yish

Zip ichidagi fayllarni repo root qismiga tashlang va mavjud fayllarni overwrite qiling:

- package.json
- tsconfig.json
- next.config.ts
- next-env.d.ts
- vercel.json
- .env.example
- .gitignore

## 2) O'chiriladigan fayl

Repo root ichidagi quyidagi faylni o'chiring:

```txt
neext-env.d.ts
```

Uning o'rniga to'g'ri fayl nomi:

```txt
next-env.d.ts
```

## 3) Vercel Environment Variables

Vercel Dashboard → Project → Settings → Environment Variables ichiga qo'shing:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Qiymatlarni Supabase project settings ichidan oling.

## 4) Vercel Settings

- Framework Preset: Next.js
- Root Directory: bo'sh qolsin / repo root
- Build Command: npm run build
- Install Command: npm ci
- Output Directory: bo'sh qolsin

## 5) Local tekshirish

```bash
npm ci
npm run build
```

Agar env yo'q bo'lsa, Supabase xatolik beradi. Bu normal: `.env.local` yaratib, `.env.example`dagi 2 ta keyni haqiqiy qiymatga almashtiring.
