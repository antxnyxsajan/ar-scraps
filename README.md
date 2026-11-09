# ScrapXtrade — Global B2B Scrap Trading Marketplace Clone

A clean, polished, mobile-optimized clone of [ScrapXtrade.com](https://scrapxtrade.com/) designed to run **both locally** and **directly on GitHub Pages with 1-click deployment**.

---

## 🚀 Can I Host This in GitHub Pages?

**YES, 100%!**

The project is structured so that **no backend build step is required**. It runs natively on GitHub Pages with all core functionality intact:
- ✅ **Instant Search & Real-Time Category Filters** (0ms latency in-browser).
- ✅ **Live Scrap Prices & Currency Converter** (INR ₹, USD $, EUR €, AED).
- ✅ **Post Scrap Modal**: Add new scrap offers with photo previews — saved directly to `localStorage` so they persist across page refreshes.
- ✅ **Direct WhatsApp Inquiries**: Instant connection via `wa.me` pre-filled with listing details.
- ✅ **OTP Auth Simulation**: One-click login with test code `7890`.

---

## 🌐 How to Deploy to GitHub Pages (Step-by-Step)

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ScrapXtrade Marketplace"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** (top right tab).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment** > **Branch**:
     - Select branch: `main`
     - Select folder: `/ (root)`
   - Click **Save**.

3. **Visit Your Live Site**:
   Within ~60 seconds, GitHub Pages will deploy your site at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🏃 Running Locally on Your Computer

If you want to run it locally with the Node.js development server:

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

> 💡 **Port Conflict Protection**: If port `3000` is already in use by another app, the server will automatically detect it and bind to the next available port (`3001`, `3002`, etc.) without crashing!

3. **Open in browser**:
   Visit **[http://localhost:3000](http://localhost:3000)** (or the port shown in your terminal).

---

## 🛠️ The Tech Stack Explained

| Layer | Technology | Why This Choice? |
|---|---|---|
| **Hosting Compatibility** | **GitHub Pages + Express.js** | Static first design allows instant free hosting on GitHub Pages, while still supporting a local Node.js server. |
| **Frontend Core** | **Vanilla ES6 JavaScript** | Zero compilation, zero hydration delay, ultra-fast mobile performance. |
| **Styling & Design** | **Tailwind CSS + Bootstrap Icons** | Utility-first styling matching ScrapXtrade's exact emerald brand (`#059669`), with crisp SVG vector icons. |
| **Data & Storage** | **JSON Store + LocalStorage** | Structured placeholder dataset bundled in `data/data.json`, with browser `localStorage` for newly added listings, likes, and bookmarks. |

---

## 📁 Repository File Structure

```
AR SCRAP SITE/
├── index.html              # Semantic, responsive marketplace markup (GitHub Pages root)
├── css/
│   └── style.css           # Glassmorphism, iOS Dynamic Island & responsive animations
├── js/
│   ├── app.js              # Orchestrator: search, filters, drawer, toast alerts
│   ├── listings.js         # Scrap listings, post details modal, likes & WhatsApp inquiry
│   ├── prices.js           # Live price board, currency converter (INR, USD, EUR, AED), sparkline SVGs
│   ├── postModal.js        # Add scrap listing modal with image preview & LocalStorage persistence
│   └── auth.js             # Unified OTP login, trader profiles & persistent state
├── data/
│   └── data.json           # Clean placeholder dataset (scrap offers, live prices, news, blogs)
├── assets/
│   └── logo.svg            # Clean ScrapXtrade vector brand logo
├── server.js               # Optional local Express server with auto-port fallback
├── package.json            # Scripts & dependencies (express, cors)
├── .gitignore              # Ignores node_modules and logs
└── README.md               # Documentation & deployment guide
```
