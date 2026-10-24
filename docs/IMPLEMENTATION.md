# MailSweep - Implementation Log

## Phase 1: Project Setup

### Objective

Set up the development environment with Next.js, PostgreSQL (Neon), and Prisma ORM.

---

# 1. Create Next.js Project

```bash
npx create-next-app@latest mailsweep
```

Selected Options:

```
TypeScript?          No
ESLint?              Yes
Tailwind CSS?        Yes
src/ directory?      No
App Router?          Yes
Turbopack?           Yes
Import Alias?        Yes (@/*)
```

Move into the project:

```bash
cd mailsweep
```

Start development server:

```bash
npm run dev
```

---

# 2. Create Neon PostgreSQL Database

Created a PostgreSQL database using Neon.

Copied the connection string provided by Neon.

Example:

```env
DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require&channel_binding=require"
```

---

# 3. Install Prisma

Installed Prisma CLI and Prisma Client.

```bash
npm install prisma@6 @prisma/client@6
```

> Prisma v6 was used because it has stable documentation and broad community support.

---

# 4. Initialize Prisma

```bash
npx prisma init
```

Generated structure:

```
prisma/
    schema.prisma

.env
```

---

# 5. Configure Environment Variables

Updated `.env`

```env
DATABASE_URL="postgresql://..."
```

This connection string points Prisma to the Neon PostgreSQL database.

---

# 6. Define Database Schema

Created two models.

## User

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())

  senders   Sender[]
}
```

---

## Sender

```prisma
model Sender {
  id               String   @id @default(cuid())

  senderEmail      String
  senderName       String?

  emailCount       Int      @default(0)

  unsubscribeUrl   String?

  unsubscribed     Boolean  @default(false)

  createdAt        DateTime @default(now())

  userId           String
  user             User @relation(fields: [userId], references: [id])
}
```

### Schema Design

Relationship:

```
User
 │
 ├── Sender
 ├── Sender
 ├── Sender
```

Each user can have multiple newsletter senders.

---

# 7. Run Database Migration

Generate migration and create tables.

```bash
npx prisma migrate dev --name init
```

Prisma automatically:

- Creates database tables
- Creates constraints
- Creates indexes
- Generates migration SQL
- Generates Prisma Client

No manual SQL was required.

---

# 8. Prisma Migrations

Generated folder:

```
prisma/

migrations/
    2026xxxx_init/
        migration.sql
```

Prisma keeps a complete history of every schema change.

---

# 9. Generate Prisma Client

Automatically generated during migration.

Prisma Client is used to interact with PostgreSQL without writing SQL manually.

Example:

```javascript
await prisma.user.findMany();

await prisma.user.create({
    data:{
        email:"abc@gmail.com"
    }
});
```

---

# 10. Verify Database

Launch Prisma Studio.

```bash
npx prisma studio
```

Default URL:

```
http://localhost:5555
```

Used to inspect tables and records visually.

---

# Project Structure

```
mailsweep/

app/

public/

prisma/
│
├── migrations/
│
└── schema.prisma

.env

package.json
```

---

# Technologies Used

- Next.js (App Router)
- React
- Tailwind CSS
- PostgreSQL
- Neon
- Prisma ORM

---

# Why Prisma?

Instead of writing SQL like:

```sql
CREATE TABLE users (...);

ALTER TABLE users ADD COLUMN ...;
```

Prisma allows schema definition in a single file:

```prisma
model User {
    ...
}
```

Running:

```bash
npx prisma migrate dev
```

automatically:

- Generates SQL
- Applies migrations
- Creates tables
- Updates the database schema
- Generates Prisma Client

This simplifies database management while maintaining migration history.

---

# Current Status

✅ Next.js project created
✅ Neon PostgreSQL connected
✅ Prisma configured
✅ Database schema defined
✅ Initial migration completed
✅ Prisma Client generated
✅ Database ready for development
✅ Phase 2: Google OAuth 2.0 & Gmail API integrated
✅ Phase 3: Subscription detection engine & scoring algorithm implemented
✅ Phase 4: Full App UI & Route Groups (Landing, Login, Dashboard, Subscriptions, Detail, Settings)
✅ Phase 5: 1-Click unsubscribe (RFC 8058/2369) & Bulk Trashing built and validated

---

## Phase 2: Authentication & Gmail Integration

- **Google OAuth 2.0 (`app/api/auth/login`, `app/api/auth/callback/google`)**:
  - Secure offline consent flow with minimal Gmail scopes (`gmail.readonly`, `gmail.modify`).
  - Automatic token management and encrypted session cookies with `jose`.
  - Database upsert for User record preserving OAuth tokens.

---

## Phase 3: Subscription Detection & Scanning

- **Gmail Client (`lib/gmail.js`)**:
  - Batch message metadata fetching (headers only: `From`, `Subject`, `Date`, `List-Unsubscribe`, `List-Unsubscribe-Post`, `Precedence`).
  - RFC 2822 sender parsing, grouping, and promotion categorization.
  - Gmail message trashing API integration.
- **Detector Engine (`lib/subscription-detector.js`)**:
  - RFC 2369 & RFC 8058 parser identifying `one_click`, `url`, and `mailto` unsubscribe methods.
  - Multi-factor confidence scoring.
- **Scan Endpoint (`app/api/scan/route.js`)**:
  - Asynchronous background scan with real-time status reporting and upsert into PostgreSQL.

---

## Phase 4: User Interface & Experience

- **Design System (`app/globals.css`)**:
  - Curated dark aesthetic with obsidian surfaces, glowing indigo accents, and micro-animations.
- **Landing Page (`app/page.js`)**:
  - High-converting landing page with interactive mockups and instant Google auth CTA.
- **App Shell (`components/AppShell.js`)**:
  - Responsive navigation sidebar, route highlighting, and quick profile stats.
- **Dashboard (`app/(app)/dashboard/page.js`)**:
  - Real-time stat cards, customizable scan range (1m, 3m, 6m, 1y), live scanning progress bar, recent subscriptions table.
- **Subscriptions Table (`app/(app)/subscriptions/page.js`)**:
  - Filter tabs (All, Active, Unsubscribed, Kept), search, sort (most emails, newest, oldest, alphabetical), bulk selection bar, and multi-unsubscribe modal with optional message trashing.
- **Subscription Detail (`app/(app)/subscriptions/[id]/page.js`)**:
  - Deep-dive sender inspection with recent email snippets, confidence meter, unsubscribe link, and "Keep Receiving" action.
- **Settings (`app/(app)/settings/page.js`)**:
  - Profile card, privacy assurance overview, and secure logout.