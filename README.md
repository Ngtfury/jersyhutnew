# Jersey Hut — Editorial Football Jersey Store

A high-performance, fashion-editorial ecommerce website for **Jersey Hut**, inspired by the minimalist luxury aesthetic, typography hierarchy, and layout rhythm of **Hillover**. Built natively with **Next.js 16 (App Router)** and optimized for **Vercel** deployment.

---

## ⚡ Highlights & Architecture

- **Next.js App Router**: Full SSR/SSG support with `src/app/`.
- **Pre-rendered Static Generation (SSG)**: All collection routes and 22+ product pages are pre-rendered at build time with `generateStaticParams()` for instant Edge CDN delivery on Vercel.
- **Editorial Monochrome Aesthetic**: Refined black-and-white palette (`#000000`, `#FFFFFF`, `#F6F6F4`), hairline borders, oversized typography, and image-first presentation.
- **Header & Navigation**: Fixed sticky black header with exact items: `HOME`, `FULL SLEEVES`, `HALF SLEEVES`, `OVERSIZED`, `ABOUT US`.
- **Live Search Overlay**: Instant search across titles, clubs, players, categories, and sleeve styles with hotkeys (`ESC`).
- **Sliding Cart Drawer**: Free shipping threshold calculator (`₹999`), quantity controls, size badges, and `localStorage` persistence.
- **Dynamic Category Filter Tabs**: Instant filtering on Best Sellers without full page reloads.
- **Product Detail Pages**: Multi-image thumbnail gallery, size selector with real-time stock indicator, interactive Size Guide modal, and accordion drawers.
- **WhatsApp Support Widget**: Direct customer support button.

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🌐 Deploying to Vercel (Zero Configuration)

The project is built specifically to be 100% plug-and-play with Vercel.

### Option A: Via GitHub (Recommended)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your repository.
4. Vercel will automatically detect **Next.js**, set the build command to `next build`, and deploy in seconds!

### Option B: Via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts to link and deploy directly from your local terminal.
