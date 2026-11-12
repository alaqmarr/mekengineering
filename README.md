# Mek Engineering Corporation (`mekengg.com`)

Production-ready B2B industrial storefront, visual inline CMS, and admin dashboard built for **Mek Engineering Corporation** (`https://mekengg.com`).

## Tech Stack
- **Framework**: Next.js 16 (App Router, Standalone Output, TypeScript) + Tailwind CSS v4
- **Database**: SQLite via `@libsql/client` + Drizzle ORM (`WAL` mode + `busy_timeout` concurrency PRAGMAs)
- **Authentication**: NextAuth v5 (`next-auth@5.0.0-beta.32`) Credentials Auth + One-Time `/setup` Admin Provisioning Wizard
- **Object Storage**: Dual **Cloudflare R2** connections (`Connection #1` & `Connection #2`) with **One-Click Cloudflare Connect**, strict active pre-setup bucket verification, and **random load-balanced upload distribution**
- **Image Upload UX**: `react-dropzone` drag-and-drop + `Ctrl+V` clipboard paste across all admin & page-level editors
- **Email**: Nodemailer + Gmail SMTP (credentials stored & editable inside SQLite from `/admin`)
- **Notifications**: Sileo (`sileo`) physics toast notifications styled in Mek Engineering brand colors

---

## Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional — R2 & SMTP are managed directly in `/admin`):
   ```bash
   cp .env.example .env
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Create your Master Admin Account**:
   - There is **no hardcoded default admin username/password**.
   - Open **`http://localhost:3000/setup`** on first launch to create your administrator email and password.
   - Once created, you are automatically signed into `/admin` and `/setup` permanently locks itself.

---

## Key Capabilities

### 1. Smart Hybrid CMS + Admin Dashboard
- **Hover Pencil Inline Editing**: When logged in as admin (with Inline Pencil Mode toggled ON in the bottom bar), static headings, copy, stats, badges, and banners show hover pencil triggers for instant modal editing saved directly to SQLite.
- **Dynamic Navigation & Catalog**: Navbar dropdowns, Footer quick links & top categories, and catalog grids render dynamically from database entities without hover pencils hijacking clickable links.
- **Centralized Creation + Page-Level Editing**:
  - Add/delete Products, Categories, Subcategories, Brands, Hero Slides, Inquiries, Page SEO, and Integrations in `/admin`.
  - Edit any individual Product (`/products/[id]`), Category (`/categories/[id]`), Subcategory (`/subcategories/[id]`), or Brand (`/brands/[id]`) directly on its own live detail page.

### 2. Dual Cloudflare R2 Connections (`Connection #1` & `Connection #2`)
- Go to **`/admin` → R2 & SMTP Keys**.
- Click **"1-Click Open Cloudflare Token Page"**, create the pre-scoped R2 token in Cloudflare, and paste it in.
- The server verifies the token, checks your **pre-setup active R2 buckets** (connection only succeeds if at least one bucket already exists), verifies S3 read/head access, and auto-detects custom/`r2.dev` public URLs.
- Connect **1 or 2 buckets** — when both are active, image uploads via `react-dropzone` or `Ctrl+V` randomly distribute across both buckets with automatic failover.

---

## Deploying to Production (`mekeng` on Port `3600`)

1. Clone the repository on your server and run the root setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   This installs dependencies, builds the Next.js standalone bundle, copies static/public assets, generates `.env` (`PORT=3600`), and starts PM2 under the process name **`mekeng`** on **`127.0.0.1:3600`**.
2. *(Optional full VM + Nginx provisioning)* Use `deploy/oracle-ubuntu-setup.sh` and `deploy/nginx-mekengg.conf` (configured to proxy to `127.0.0.1:3600`), then run:
   ```bash
   sudo certbot --nginx -d mekengg.com -d www.mekengg.com
   ```
3. Visit **`https://mekengg.com/setup`** to initialize your administrator account, then go to **`/admin` → Import .db Catalog** to upload your local `data/mekengineering.db` file and copy all categories, subcategories, and products in one click.
