# Site Structure

The site is built with Eleventy. Source pages live in `src/`, shared static files live at the project root, and the build writes everything to `_site/`, which Netlify publishes (see `netlify.toml`).

## Source Layout

```text
lion-dance-website/
  .eleventy.js                       Build config: passthrough copies, filters, Google tag, CSS bundling
  netlify.toml                       Netlify build settings and legacy-URL 301 redirects
  src/                               Eleventy input (edit pages here)
    index.html                       Home page
    googlec17fc805b7cef4a4.html      Google Search Console verification
    sitemap.njk                      Generates sitemap.xml from src/_data/seo/*.json
    script.js.njk                    Shared site script, output as /script.js
    backend-config.js.njk            Public backend config, output as /backend-config.js
    src.11tydata.js                  Output paths: src/foo/bar.html -> _site/foo/bar.html
    pages/                           Core pages
    gallery/                         Gallery index and nine album pages
    landing/                         SEO landing pages
    admin/                           Content editor (noindex)
    crm/                             Inquiry CRM (noindex)
    _includes/                       Shared chrome and templates (head, header, footer, quickbar,
                                     landing-body, album-body, seo-meta, fonts, landing-related)
    _data/                           Content data (site, services, pricing, faq, landing/, galleries/,
                                     seo/, landingLinks, galleryIndex, contentCatalog, backend)
  css/                               Stylesheets (passthrough; live source)
    style.css                        Entry file; @imports the modules below
    base.css, components.css, header.css, responsive.css
    sections/                        Section styles bundled into style.css
    pages/                           Page-specific styles loaded by individual pages
  assets/                            Icons, vendor files, ink-run frames, assets/js/ (passthrough)
  images/                            Website images (passthrough; large, don't scan wholesale)
  models/                            3D .glb assets (passthrough)
  scripts/                           Build and check scripts (image optimizing, CSS bundling, link/SEO/backend checks)
  tests/                             Unit tests (node --test)
  supabase/                          Backend config, edge functions, migrations
  docs/                              Project documentation; docs/ai-system/ holds AI operating rules
  _site/                             Build output; regenerated on every build, never edit
```

There is no root `index.html`, root `script.js`, `js/` folder, or hand-written `sitemap.xml` any more; those were pre-Eleventy files.

## Build Notes

- `npm run build` optimizes images (`scripts/optimize-images.mjs`), then runs Eleventy.
- `css/style.css` and its `@import`s are bundled and minified into one `_site/css/style.css` (`scripts/build-styles.mjs`). Files in `css/pages/` are copied as-is and loaded by the pages that need them.
- Each built HTML page outside `admin/` and `crm/` gets the Google tag injected at build time.
- `npm test` runs unit tests, the build, and the link, backend-contract, and SEO checks (the same steps as CI).
- Preview with `npm run serve`. `python3 -m http.server` cannot resolve the extensionless internal links.

## Public Pages

URLs are extensionless; Netlify serves `/pages/about` from `pages/about.html`.

Root:

- `/` — `src/index.html`

Core pages (`src/pages/`):

- `/pages/about`
- `/pages/services`
- `/pages/contact`
- `/pages/dragon-lion-introduction`
- `/pages/temple-festival-planning`
- `/pages/privacy`
- `/pages/ink-dragon-scroll` — ink-scroll animation, embedded as an iframe in the introduction page

Gallery pages (`src/gallery/`; album pages share `_includes/album-body.njk`, content in `_data/galleries/`):

- `/gallery/` (index)
- `/gallery/opening`
- `/gallery/banquet`
- `/gallery/tourism`
- `/gallery/funeral`
- `/gallery/groundbreaking`
- `/gallery/festival-retail`
- `/gallery/temple`
- `/gallery/school`
- `/gallery/performance`

SEO landing pages (`src/landing/`; share `_includes/landing-body.njk`, content in `_data/landing/`):

- `/landing/dragon-lion-dance-performance`
- `/landing/lion-dance-performance`
- `/landing/opening-lion-dance`
- `/landing/company-event-lion-dance`
- `/landing/year-end-party-lion-dance`
- `/landing/lion-dance-price-guide`

Internal tools (`noindex, nofollow`, no Google tag):

- `/admin/` with `seo`, `technical`, `image-guide`
- `/crm/`

## URL Rules

Internal links are root-absolute and extensionless:

```html
<a href="/pages/about">關於我們</a>
<a href="/gallery/opening">開幕開工</a>
<a href="/landing/lion-dance-performance">舞獅表演</a>
```

Do not link to `.html` URLs. `tests/seo-routes.test.mjs` fails if public source links or canonicals use legacy `.html` routes.

Page files sit one folder deep, so existing pages load assets with `../` paths (`../css/style.css`, `../script.js`); `src/index.html` uses `css/style.css`. Root-absolute asset paths (`/css/style.css`) also work. Keep the `?v=` cache token on stylesheet and script tags, and bump it when the file changes.

## Files To Update When Adding, Moving, Or Renaming A Page

1. The page's SEO record in `src/_data/seo/*.json` (`path`, title, description). Canonical, Open Graph tags, and `sitemap.xml` are generated from it.
2. Navigation and footer links in `src/_includes/header.njk` and `src/_includes/footer.njk`.
3. Quickbar links in `src/_includes/quickbar.njk`.
4. Cross-links in `src/_data/landingLinks.json`, `src/_data/galleryIndex.js`, and any page body or card links.
5. JSON-LD URLs and `@id` values in the page itself (home, landing, and gallery pages contain JSON-LD).
6. The editor's page list in `supabase/functions/_shared/content-schema.mjs` (`seoPages` and `entries`), if editors manage the page. `src/_data/contentCatalog.js` reads from it.
7. A 301 redirect from the old URL in `netlify.toml` (`force = true`), plus the matching entry in `tests/seo-routes.test.mjs`, which lists every expected redirect.
8. Any docs that mention the old path.

Run `npm test` afterwards; the link and SEO checks catch most missed references.
