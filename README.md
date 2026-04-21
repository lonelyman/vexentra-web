# vexentra-web

Frontend ของ Vexentra — Portfolio Showcase และ Admin Panel สร้างด้วย **Next.js 16 App Router** + **React 19** + **TypeScript**

---

## Tech Stack

|           |                                        |
| --------- | -------------------------------------- |
| Framework | Next.js 16 (App Router)                |
| Language  | TypeScript 5                           |
| Styling   | CSS Modules + Tailwind CSS 4           |
| Auth      | Server Actions + httpOnly cookie (JWT) |
| API       | `fetch` ผ่าน `src/lib/api/`            |

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── (auth)/             # Login page (route group, ไม่มี layout ร่วม)
│   │   └── login/
│   ├── (portfolio)/        # Public portfolio showcase
│   │   └── portfolio/
│   ├── admin/              # Admin panel (protected, ต้องล็อกอิน)
│   │   ├── layout.tsx      # Sidebar + AdminNav
│   │   └── page.tsx        # หน้าแก้ไขโปรไฟล์
│   ├── actions/
│   │   ├── auth.ts         # Server Actions: login, logout, register
│   │   └── profile.ts      # Server Actions: updateProfile, addPortfolio ฯลฯ
│   └── api/
│       ├── clear-session/  # Route handler: ล้าง cookie
│       └── refresh-session/ # Route handler: refresh access token
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx    # Client component — nav ที่ใช้ usePathname()
│   │   ├── LoginForm.tsx
│   │   └── ProfileForm.tsx
│   ├── layout/
│   │   ├── Footer.tsx
│   │   ├── PortfolioSectionNav.tsx
│   │   └── PublicNavbar.tsx
│   └── sections/           # Portfolio sections (Hero, Skills, Experience ฯลฯ)
├── lib/
│   └── api/
│       ├── types.ts        # TypeScript interfaces ทั้งหมด
│       ├── client.ts       # fetch functions (fetchShowcase, fetchSocialPlatforms)
│       └── index.ts        # re-export
└── styles/                 # CSS แยกตาม section/page
```

---

## Environment Variables

สร้างไฟล์ `.env.local` สำหรับ local dev:

```env
# URL ของ API ฝั่ง server (SSR/Server Actions ใช้ internal Docker network)
INTERNAL_API_URL=http://api:3000/api/v1

# URL ของ API ฝั่ง browser (client fetch)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Dev origins ที่ Next.js อนุญาต (สำหรับ allowedDevOrigins, คั่นด้วย comma)
ALLOWED_DEV_ORIGINS=192.168.1.100,10.0.0.1
```

> ถ้ารันผ่าน Docker Compose ตัวแปรเหล่านี้ถูกกำหนดใน `docker-compose.yml` แล้ว ไม่ต้องสร้าง `.env.local`

---

## การรันในเครื่อง

### วิธีที่ 1 — Docker Compose (แนะนำ)

```bash
# จาก root ของ monorepo
docker compose up --build
```

Web จะขึ้นที่ `http://localhost:${WEB_PORT}` (ค่า default: 3001)

### วิธีที่ 2 — รันตรง

```bash
cd vexentra-web
npm install
npm run dev
```

Web จะขึ้นที่ `http://localhost:3000`

---

## Auth Flow

```
Browser → POST /actions/auth (Server Action)
       → API: POST /api/v1/auth/login
       → Set httpOnly cookie: access_token, refresh_token
       → Redirect → /admin
```

- **access_token** — อายุ 15 นาที
- **refresh_token** — อายุ 7 วัน, auto-refresh ผ่าน `/api/refresh-session`
- Cookie flag: `httpOnly`, `sameSite=lax`, `secure` เฉพาะ production

---

## API Client

`src/lib/api/client.ts` ใช้ URL ต่างกันตาม context:

| Context                    | URL ที่ใช้                           |
| -------------------------- | ------------------------------------ |
| Server (SSR/RSC)           | `INTERNAL_API_URL` (Docker internal) |
| Browser (Client Component) | `NEXT_PUBLIC_API_URL`                |

---

## Branch Strategy

| Branch | วัตถุประสงค์                                             |
| ------ | -------------------------------------------------------- |
| `main` | Production-ready, **protected** — merge ผ่าน PR เท่านั้น |
| `dev`  | Development/testing — push ได้โดยตรง                     |

---

## Scripts

```bash
npm run dev      # dev server (hot reload)
npm run build    # production build
npm run start    # รัน production build
npm run lint     # ESLint
```
