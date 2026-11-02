# Deployment & Name-Ranking SEO Guide — Sakib Alam Mubin

## 1. Hosting (Zero-Build Static)

### GitHub Pages (`https://thesamubin.github.io/`)
1. Push to `main`. `.github/workflows/static.yml` automatically deploys the site to GitHub Pages.
2. Under **Settings → Pages**, verify **Source** is set to **GitHub Actions** and **Custom domain** is left **empty** (since `samubin.com` is reserved for the future Next.js/Node project).

### Cloudflare Pages (Optional Mirror)
1. Connect repository `thesamubin/thesamubin.github.io` in Cloudflare Pages.
2. **Framework preset:** `None` · **Build command:** *(empty)* · **Build output directory:** `/`.
3. `_headers` and `_redirects` at the repo root automatically configure security headers, font caching, and 301 redirects from legacy `.html` URLs.
4. All pages keep `<link rel="canonical" href="https://thesamubin.github.io/...">` so search engines consolidate ranking equity onto one canonical URL.

---

## 2. Off-Site Checklist to Rank #1 for "Sakib Alam Mubin"

On-page entity markup (`Person`, `ProfilePage`, `WebSite` JSON-LD, exact `<h1>`, `alternateName`, and `rel="me"`) is already built in. Complete these off-site steps so Google's Knowledge Graph connects every profile:

1. **Unify Name Spelling Everywhere:** Use **Sakib Alam Mubin** (or `Sakib Alam Mubin (SA Mubin)`) on GitHub, LinkedIn, X/Twitter, YouTube, Medium/DEV.to, TryHackMe, and HackTheBox. Remove old "Syed" prefixes so crawlers see 100% consistency.
2. **Circular `sameAs` Verification:**
   - Put `https://thesamubin.github.io/` in the **Website** field of every social profile.
   - Add each profile URL to `data/identity.json` and the `sameAs` array in `index.html` and `about/index.html`, plus a `<a rel="me noopener">` link on `/contact/`.
3. **GitHub Profile README:** Create repo `thesamubin/thesamubin` with a short `README.md` introducing **Sakib Alam Mubin (SA Mubin)** and linking to `https://thesamubin.github.io/`.
4. **Search Console & Bing:**
   - Verify `https://thesamubin.github.io/` in **Google Search Console** (HTML meta tag or Google Analytics-free file verification), submit `https://thesamubin.github.io/sitemap.xml`, and click **Request Indexing** for `/`, `/work/`, `/about/`, and `/contact/`.
   - Import the Search Console property into **Bing Webmaster Tools**.
5. **Future Handover to `samubin.com`:**
   - When the Next.js/Node site launches on `samubin.com`, copy `data/identity.json` and the `@graph` JSON-LD into the new site, then update `<link rel="canonical">` here to point to `https://samubin.com/`.
