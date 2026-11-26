# spk-bansos-web
Frontend Sistem Pendukung Keputusan Penerima Bansos metode SAW: kelola kriteria, data calon penerima, penilaian, dan hasil perankingan. Dibangun dengan React (Vite).

## Menjalankan (development)
Jalankan API (`spk-bansos-api`) terlebih dahulu, lalu:
```bash
npm install
npm run dev      # http://localhost:5173 (request /api diteruskan ke http://localhost:3000)
```

## Build
```bash
npm run build
```
Image Docker dibangun lewat `docker-compose.yml` di repo `spk-bansos-api`.

## Deploy ke Vercel
Import repo ini sebagai project Vercel (Framework Preset: *Vite*). `vercel.json` meneruskan `/api/*` ke
project API dan mengarahkan semua rute lain ke `index.html` (agar refresh di `/desa/hasil` dll. tidak 404).

**Wajib:** ganti `https://spk-bansos-api.vercel.app` di `vercel.json` dengan domain project
`spk-bansos-api` yang sebenarnya. Tidak perlu environment variable di project ini. Langkah lengkap
(Supabase, env API, seed) ada di README repo `spk-bansos-api`.
