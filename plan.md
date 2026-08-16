# Development Plan — BERKAHUSDT (USDT ↔ IDR) Landing Page + Admin Panel

## 1) Objectives
- Keep existing UI/UX and behaviors that already work; only fix broken parts and add missing requirements.
- Make the project run in this environment: **React (CRA/CRACO) + FastAPI + MongoDB (DB: `BERKAHUSDT`)**.
- Ensure **all landing content + rates + media links + assets** are **100% dynamic via API** and manageable in Admin Panel.
- Deliver the required **5-scene scroll-driven 3D choreography** (GSAP ScrollTrigger + Three.js) and missing landing sections.
- Upgrade security: real TOTP provisioning (QR), remove bypass codes, keep IP whitelist.

---

## 2) Implementation Steps

### Phase 1 — Core POC / Hardest-Risk Integration (must pass before broader work)
**Core to prove:** FastAPI+Mongo parity API + image storage/serve + frontend consuming env-based API (no localhost).

1. **Web research (best practices, brief):**
   - FastAPI file streaming (GridFS vs BSON base64), Motor patterns, JWT auth, TOTP (pyotp provisioning URI), rate limiting basics.
2. **Create isolated POC scripts (Python):**
   - `poc_api_parity.py`: spin up FastAPI, hit a small subset: `/api/rates (GET/PUT)`, `/api/auth/login`, `/api/config/logos`, verify JSON shapes.
   - `poc_image_store.py`: upload an image (base64), store in MongoDB, fetch back via `/api/assets/{id}` and verify bytes/type.
3. **POC success gate:**
   - Mongo reads/writes OK in DB `BERKAHUSDT`.
   - JWT issuance/verification OK.
   - Image roundtrip OK (upload + fetch + browser-displayable).

**User stories (Phase 1):**
1. As an admin, I can log in and obtain a JWT token from `/api/auth/login`.
2. As an admin, I can update buy/sell rates and immediately read them back.
3. As the landing page, I can load rates using a configurable `REACT_APP_BACKEND_URL` (no hardcoded localhost).
4. As an admin, I can upload an image asset into MongoDB and receive a stable URL.
5. As a visitor, I can open an asset URL and the image renders correctly.

---

### Phase 2 — V1 App Development (port + fix + preserve)
**Goal:** make the imported project functionally equivalent to current behavior, but running on CRA+FastAPI+Mongo, with dynamic config and no broken links.

1. **Import/merge codebase into `/app`:**
   - Bring frontend components and AdminPage as-is; keep styling/markup unless required for fixes.
2. **Frontend platform port (Vite/Tailwind v4 → CRA/CRACO + Tailwind v3):**
   - Convert `@import "tailwindcss";` → `@tailwind base; @tailwind components; @tailwind utilities;`.
   - Preserve custom utilities/animations (`glass-card`, gradients, marquee, `bg-radial-glow`).
   - Ensure build compiles under existing CRA dependencies.
3. **API base URL fix (bug #1):**
   - Replace all `http://localhost:5000/api` references with `process.env.REACT_APP_BACKEND_URL + '/api'` via a single `src/lib/api.js` helper.
4. **Backend port (Express → FastAPI parity) (bug #2):**
   - Implement FastAPI routes matching existing paths + response shapes:
     - Auth: `/api/auth/login`
     - Admin creds: `/api/admin/credentials` GET/PUT
     - Logos config + logs: `/api/config/logos`, `/api/admin/logo-logs`
     - Rates + logs: `/api/rates`, `/api/admin/rate-logs`
     - Analytics: `/api/analytics/track`, `/api/admin/visitor-analytics`
     - Orders CRUD: `/api/orders` + `/api/orders/{id}`
     - System info: `/api/admin/system-info`, `/api/admin/server-vps-info`, `/api/admin/system-logs`
     - Popups/testimonials endpoints as currently expected.
   - Use Motor, collections mapped 1:1; read DB name from env (`DB_NAME=BERKAHUSDT`).
5. **Auth + security upgrade (bug #8):**
   - JWT expiry from settings; implement IP whitelist checks.
   - Real TOTP with `pyotp`: provisioning URI endpoint (and QR data) for Admin settings.
   - Remove master bypass codes; store secret in Mongo.
6. **Image storage migration (bug #4 + Galeri prerequisite):**
   - Replace filesystem writes with Mongo-backed storage (GridFS or dedicated `assets` collection with bytes + contentType).
   - Provide stable serving route (e.g., `/api/assets/{asset_id}`) and keep existing Admin UI behavior by mapping returned URLs.
7. **Smoke test V1:**
   - Landing loads, rates show.
   - Admin login works (admin/admin).
   - Update rates/logos/popups/testimonials works.

**User stories (Phase 2):**
1. As a visitor, I see live buy/sell rates that update when admin changes them.
2. As an admin, I can log in and manage rates, logos, popups, and testimonials without errors.
3. As an admin, I can enable 2FA and scan a QR code to set it up.
4. As an admin, I can upload an image and it persists in MongoDB and displays in the UI.
5. As a maintainer, I can deploy with only env vars (no hardcoded localhost/DB name).

---

### Phase 3 — Feature Completion (requirements-driven additions)
**Goal:** add only what’s missing vs your brief; keep existing modules intact.

1. **Dynamic CMS + Social Media settings (bug #7):**
   - Add `site_settings` API + Admin UI: hero copy, CTA text, theme color, background, logo links.
   - Add `social_links` API + Admin UI: WA, Telegram channel, Telegram Admin1/Admin2, IG, X, FB; landing only renders filled links.
2. **Calculator upgrades (bug #6):**
   - Add network selection + payment method options from admin-config.
   - Fee rule: if buy ≥ 2000 USDT → gas/fee = 0; else compute per-network fee table from admin.
   - CTA buttons route to Telegram Admin 1/2 from settings.
3. **Landing 5-scene GSAP ScrollTrigger choreography (bug #5):**
   - Keep existing Three.js coin assets; refactor motion control to scene timeline:
     - Scene1 coin left + calculator right
     - Scene2 coin right + rate graph left
     - Scene3 coin left + “hand holding coin” visual + social/contact right
     - Scene4 coin right + supported networks left
     - Scene5 footer orbit mode (slow rotations + orbit coins)
4. **Admin modules completion:**
   - **Galeri**: browse/search/delete assets; select an asset to use in Popups/Testimoni/Logos.
   - **DB Manager**: backup export (download JSON), delete/clear collections, edit basic docs (MVP).
   - **Server Monitoring**: real container metrics via `psutil` + disk usage + “Clear Cache” action.
   - **API Health Monitor**: ping critical endpoints; surface red/yellow/green in dashboard.
   - Implement `GRAFIK` + `BANK` tabs as real settings stores (rate-history display settings, payment/bank methods list).

**User stories (Phase 3):**
1. As an admin, I can configure social links and only the filled links appear on the landing page.
2. As a user, I can calculate USDT↔IDR with correct fee logic per network and size.
3. As an admin, I can define supported networks and fees, and landing updates instantly.
4. As an admin, I can manage a gallery of images and reuse them in popups/testimonials.
5. As an admin, I can see container CPU/RAM/Disk and clear cache from the panel.

---

### Phase 4 — End-to-End Testing, Regression, Polish
1. Run testing agent on critical flows: landing scroll scenes, calculator, admin login/2FA, CRUD modules.
2. Fix regressions (especially AdminPage expectations vs API shapes).
3. Performance passes: lazy-load heavy sections, optimize Three.js render loop, throttle scroll handlers.

**User stories (Phase 4):**
1. As a visitor, the 3D animation stays smooth while I scroll through all scenes.
2. As an admin, I can complete all daily operations (rates, popups, testimonials, assets) without breaking the landing.
3. As an admin, I can recover via DB backup export if I made a mistake.
4. As a maintainer, I can deploy and observe health checks and logs.
5. As a security-conscious admin, I can enforce 2FA + IP whitelist and see blocked attempts.

---

## 3) Next Actions
1. Import repo contents into `/app` (replace template) and set envs:
   - `DB_NAME=BERKAHUSDT`, `MONGO_URL=...`, `CORS_ORIGINS=...`, `JWT_SECRET=...`.
2. Build Phase 1 POC scripts and verify parity endpoints + image roundtrip.
3. Start Phase 2: CRA/Tailwind conversion + API base URL helper + FastAPI backend parity.
4. After V1 smoke tests pass, proceed to Phase 3 features (CMS/social/fee settings + GSAP scenes + gallery).

---

## 4) Success Criteria
- No hardcoded localhost URLs; all API calls use `REACT_APP_BACKEND_URL`.
- FastAPI backend provides required endpoints with compatible JSON shapes; DB is `BERKAHUSDT`.
- Images are stored in MongoDB and served via API; Admin can manage gallery assets.
- Landing page implements 5 scroll scenes per brief (coin positions/faces + hand visual + orbit footer).
- Calculator supports networks/payment methods + fee rule (free ≥ 2000 USDT) + Telegram Admin 1/2 CTAs.
- Admin panel supports: dashboard analytics, DB manager (MVP backup/clear/edit), popups, testimonials bulk, CMS, social links, server monitoring, API health, security (JWT+2FA+IP whitelist).

---

## STATUS UPDATE (Phase 1 & 2 selesai)

### Selesai
- Repo GitHub MPSnode/BERKAHUSDT diimpor: seluruh assets (public/*.png, logo) + komponen React + AdminPage (5.9k baris) dipindahkan ke /app tanpa mengubah desain aslinya.
- Backend Express (2108 baris) DIPORT PENUH ke FastAPI + Motor (db.py, auth.py, routes_public.py, routes_admin.py, routes_system.py) dengan kontrak API identik. DB = BERKAHUSDT (dari env).
- Bug diperbaiki: hardcoded http://localhost:5000 (8 file) -> REACT_APP_BACKEND_URL; Tailwind v4 -> v3 (CRA/craco); import lucide `X` yang hilang di AdminPage (crash TESTIMONI); password admin kini bcrypt (bukan plaintext); TOTP asli (pyotp) + QR, bypass code 123456/654321 dihapus; upload gambar kini tersimpan di MongoDB dan diserve via /api/uploads/{filename}.
- Landing: koreografi 5 scene (GSAP ScrollTrigger + Three.js) - hero tengah, scroll1 koin kiri (wajah USDT) + kalkulator kanan, scroll2 koin kanan + grafik kiri, scroll3 koin kiri + tangan + sosmed kanan, scroll4 koin kanan + jaringan kiri, scroll5 koin bawah + orbit koin (ETH/BNB/BTC/USDC/TRX/SOL/XRP/DOGE/SHIB).
- Kalkulator: jaringan + metode pembayaran dari admin, fee gratis >= threshold (default 2000 USDT), CTA Telegram Admin 1 & 2 + WhatsApp.
- Admin Panel modul baru: GALERI, SOSIAL MEDIA, TAMPILAN UTAMA (CMS + warna tema + logo), JARINGAN & BIAYA, BANK & METODE BAYAR, GRAFIK (titik data manual + auto), DB MANAGER (backup/restore/edit/hapus/bersihkan), API HEALTH MONITOR, 2FA & IP WHITELIST, tombol Clear Cache + monitoring RAM/CPU/SSD nyata (psutil).

### Berikutnya
- Phase 3: pengujian end-to-end (testing agent) + perbaikan bug.
