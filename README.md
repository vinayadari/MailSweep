# 📧 MailSweep — Gmail Subscription Manager

A modern, fast, and privacy-focused web application to connect your Gmail, automatically detect subscription senders and newsletters, browse them, inspect recent emails, unsubscribe in 1-click, and optionally batch trash existing promotional emails.

---

## 🚀 Features

- **🔐 Google OAuth 2.0**: Minimal readonly metadata and modify scopes (`gmail.readonly`, `gmail.modify`). Zero storage of email bodies.
- **⚡ Background Scanner**: Intelligent inbox scanner that fetches message headers in chunks and groups emails by sender.
- **🎯 RFC 2369 & RFC 8058 Detection**: Automatically parses `List-Unsubscribe` and `List-Unsubscribe-Post` headers to provide:
  - **1-Click Unsubscribe**: Automatic HTTP POST request compliant with modern newsletter standards.
  - **URL Unsubscribe**: Direct web link to the sender's unsubscription page.
  - **Mailto Fallback**: Direct email unsubscription link.
- **📊 Real-time Dashboard**:
  - Live statistics: Active subscriptions, total emails scanned, unsubscription rate, cleanup metrics.
  - Configurable scan range: 1 month, 3 months, 6 months, 1 year, or all time.
  - Interactive progress indicator during active scans.
- **📋 Subscriptions Manager**:
  - Bulk select & bulk unsubscribe with floating action bar.
  - Filter by Active, Unsubscribed, or Kept.
  - Search by sender name or email address.
  - Sort by email frequency, newest, oldest, or alphabetically.
- **🔍 Subscription Detail Inspector**:
  - Inspect sender frequency, first and last email dates, and detection confidence.
  - View snippets and subjects of recent emails from this sender.
  - "Keep Receiving" action to whitelist trusted senders.
  - Unsubscribe modal with optional "Move all existing emails from this sender to Trash" checkbox.
- **⚙️ Settings & Privacy**:
  - View authenticated profile.
  - Transparency overview of stored metadata.
  - Session termination and logout.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database**: PostgreSQL on [Neon](https://neon.tech/)
- **ORM**: [Prisma v6](https://www.prisma.io/)
- **Styling**: Vanilla CSS design tokens with curated obsidian dark mode
- **State & Caching**: TanStack React Query v5
- **APIs**: Google APIs (`googleapis`), Google OAuth 2.0

---

## 🏁 Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon or local)
- Google Cloud project with Gmail API enabled and OAuth 2.0 credentials

### 2. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```env
DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. Add the following **Authorized Redirect URI**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Ensure scopes include:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`

### 4. Install Dependencies & Migrate Database

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view MailSweep.
