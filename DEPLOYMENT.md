# Deployment & QA Documentation

## QA Verification Checklist
- [x] **Internal/External Links**: All relative paths target `.html` explicitly (`href="about.html"`), which works natively on static hosts without rewrite rules.
- [x] **Asset Paths**: All CSS and JS use relative paths (`assets/css/...`), fully compatible with both root domains and subpath deployments.
- [x] **SEO & Structured Data**: Validated JSON-LD exists on all pages. Meta tags are uniquely populated per page.
- [x] **404 Page**: Added `404.html`, which GitHub Pages natively routes to on missing paths.

## GitHub Pages Deployment
Since the project relies solely on vanilla HTML/CSS/JS, no build step (like `npm run build`) is required.
1. The existing `.github/workflows/static.yml` (from GitHub's static HTML template) will perfectly deploy this repository.
2. It uploads the entire repository content (from root `.`) to the `github-pages` environment.
3. Ensure that **Settings > Pages** is configured to deploy via **GitHub Actions**.

## GitLab Pages Deployment
To deploy on GitLab Pages, add a `.gitlab-ci.yml` file to the root:
```yaml
pages:
  stage: deploy
  script:
    - mkdir .public
    - cp -r * .public
    - mv .public public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Custom Domain Configuration
For `samubin.com`:
1. **GitHub Pages**: You can add a file named `CNAME` in the root directory containing exactly `samubin.com`. Alternatively, configure it via Settings > Pages > Custom Domain (GitHub will auto-create the CNAME file).
2. **DNS Settings**: Add an `A` record pointing to GitHub's IPs (`185.199.108.153` etc.) and a `CNAME` record for `www` pointing to `thesamubin.github.io`.

## Platform Export Guidance (DEV.to, Hashnode, WordPress)
- **CSS Architecture**: The `layout.css` and `components.css` files do not depend on external frameworks like Tailwind. They can be copied into WordPress custom HTML blocks directly.
- **Portability**: Content inside `<main>` can be extracted and reused on CMS platforms without conflicts, as it relies strictly on semantic tags and utility-lite classes.
