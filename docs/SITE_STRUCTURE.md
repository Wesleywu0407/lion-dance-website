# Site Structure

This project is now organized as a static website with public HTML pages grouped by purpose.

## Current Structure

```text
liondancewebsite/
  index.html                         Home page; stays at root for static hosting
  googlec17fc805b7cef4a4.html        Google verification; stays at root
  pages/
    about.html                       About page
    services.html                    Services page
    contact.html                     Contact page
  gallery/
    index.html                       Main gallery page
    opening.html                     Opening ceremony gallery
    banquet.html                     Banquet gallery
    tourism.html                     Tourism performance gallery
    funeral.html                     Memorial ceremony gallery
    groundbreaking.html              Groundbreaking gallery
    festival-retail.html             Festival and retail gallery
    temple.html                      Temple and birthday ceremony gallery
    school.html                      School and company teaching gallery
    performance.html                 Stage performance gallery
  landing/
    dragon-lion-dance-performance.html
    lion-dance-performance.html
    opening-lion-dance.html
    company-event-lion-dance.html
  css/                               Stylesheets
  js/                                Page scripts or future JS modules
  script.js                          Shared site script
  images/                            Website images
  assets/                            Icons and supporting assets
  models/                            3D assets
  docs/                              Project documentation
  docs/ai-system/                    AI operating rules
  .claude/                           Claude/Codex local settings
```

## URL Rules

Use root-absolute URLs for internal links and assets. This keeps pages working from any folder depth.

Examples:

```html
<a href="/pages/about.html">關於我們</a>
<a href="/gallery/opening.html">開幕開工</a>
<a href="/landing/lion-dance-performance.html">舞獅表演</a>
<link rel="stylesheet" href="/css/style.css">
<script src="/script.js" defer></script>
```

Do not use folder-relative asset paths in moved HTML pages:

```html
<!-- Avoid -->
<link rel="stylesheet" href="css/style.css">
<img src="images/example.webp">
```

## Public Page Groups

Root pages:

- `index.html`
- `googlec17fc805b7cef4a4.html`

Core pages:

- `pages/about.html`
- `pages/services.html`
- `pages/contact.html`

Gallery pages:

- `gallery/index.html`
- `gallery/opening.html`
- `gallery/banquet.html`
- `gallery/tourism.html`
- `gallery/funeral.html`
- `gallery/groundbreaking.html`
- `gallery/festival-retail.html`
- `gallery/temple.html`
- `gallery/school.html`
- `gallery/performance.html`

SEO landing pages:

- `landing/dragon-lion-dance-performance.html`
- `landing/lion-dance-performance.html`
- `landing/opening-lion-dance.html`
- `landing/company-event-lion-dance.html`

## Files To Update When Moving Or Renaming Pages

If any public HTML page moves again, update:

1. Internal navigation and footer links.
2. Button and card links.
3. JSON-LD URLs and `@id` values.
4. Canonical URLs.
5. Open Graph URLs.
6. `sitemap.xml`.
7. `script.js` quickbar links.
8. Any docs that mention the old path.

## SEO Note

Moving pages changes public URLs. If this is a deployed production site, configure redirects from the old root URLs to the new folder URLs at the hosting layer.

Suggested redirects:

```text
/about.html -> /pages/about.html
/services.html -> /pages/services.html
/contact.html -> /pages/contact.html
/gallery.html -> /gallery/
/gallery-opening.html -> /gallery/opening.html
/gallery-banquet.html -> /gallery/banquet.html
/gallery-tourism.html -> /gallery/tourism.html
/gallery-funeral.html -> /gallery/funeral.html
/gallery-groundbreaking.html -> /gallery/groundbreaking.html
/gallery-festival-retail.html -> /gallery/festival-retail.html
/gallery-temple.html -> /gallery/temple.html
/gallery-school.html -> /gallery/school.html
/gallery-performance.html -> /gallery/performance.html
/dragon-lion-dance-performance.html -> /landing/dragon-lion-dance-performance.html
/lion-dance-performance.html -> /landing/lion-dance-performance.html
/opening-lion-dance.html -> /landing/opening-lion-dance.html
/company-event-lion-dance.html -> /landing/company-event-lion-dance.html
```

