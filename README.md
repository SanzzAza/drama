# FlickReels - Website Drama Cina

Website drama cina yang rapi, responsif, dan terhubung ke endpoint FlickReels.

## Fitur

- Tampilkan **bahasa**, **trending**, dan daftar drama dari endpoint `nexthome`.
- Pencarian drama dengan query + pagination (`page=1`, `page=2`, dst).
- Detail drama per ID + daftar episode.
- Konversi otomatis pagination UI (`1,2,3...`) ke format API (`0,1,2...`).
- Header request API sudah diatur agar kompatibel.

## Endpoint yang dipakai

- `GET /api/drama/languages` → `.../languages`
- `GET /api/drama/trending?lang=6` → `.../trending?lang=6`
- `GET /api/drama/search?q=cinta&lang=6&page=1` → `.../search` (backend kirim page API mulai dari 0)
- `GET /api/drama/list?lang=6&page=1` → `.../nexthome` (backend kirim page API mulai dari 0)
- `GET /api/drama/detail/2889?lang=6` → `.../drama/2889?lang=6`

## Cara Jalankan

```bash
npm install
npm run dev
```

Buka: `http://localhost:3000`

## Catatan

Jika API eksternal memblokir request dari environment tertentu (mis. 403 proxy), aplikasi tetap benar secara struktur dan header, tetapi data live mungkin tidak bisa ditarik dari lingkungan tersebut.


## Akses cepat (preview statis)

Jika dibuka dari file-server statis (tanpa Express), akses `index.html` di root repo agar otomatis redirect ke `public/index.html`.

Jika dibuka lewat URL pratinjau dinamis (bukan `/`), server sekarang memakai fallback route non-API ke `public/index.html` agar tidak muncul `Not Found`.


## Deploy Vercel

Project ini sekarang support Vercel serverless API di folder `api/`, jadi endpoint frontend `/api/drama/*` tetap jalan saat deploy (tidak bergantung pada `server.js`).

