const path = require('node:path');
const fsSync = require('node:fs');

module.exports = function (eleventyConfig) {
  eleventyConfig.on('eleventy.before', async function () {
    const fs = require('node:fs/promises');
    const outputDir = path.resolve(process.cwd(), '_site');
    const projectDir = path.resolve(process.cwd());
    if (outputDir === projectDir || path.dirname(outputDir) !== projectDir) {
      throw new Error(`Refusing to clean unsafe Eleventy output path: ${outputDir}`);
    }
    await fs.rm(outputDir, { recursive: true, force: true });
  });

  const passthrough = [
    'assets',
    'css',
    'images',
    'models',
    'favicon.ico',
    'favicon.png',
    'favicon-32.png',
    'favicon-180.png',
    'robots.txt',
    'sitemap.xml'
  ];

  passthrough.forEach(function (source) {
    eleventyConfig.addPassthroughCopy({ [source]: source });
  });
  eleventyConfig.addPassthroughCopy({ 'src/admin/config.yml': 'admin/config.yml' });
  if (fsSync.existsSync('.cache/image-pipeline')) {
    eleventyConfig.addPassthroughCopy({ '.cache/image-pipeline': 'images/generated' });
  }

  eleventyConfig.addFilter('json', function (value, spaces = 2) {
    return JSON.stringify(value, null, spaces);
  });

  eleventyConfig.addFilter('urlencodePath', function (value) {
    return String(value)
      .split('/')
      .map(function (segment) { return encodeURIComponent(segment); })
      .join('/');
  });

  eleventyConfig.addFilter('faqJsonLd', function (value) {
    const items = value && Array.isArray(value.items) ? value.items : [];
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map(function (item) {
        return {
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        };
      })
    }, null, 2);
  });

  function isUploadedImage(value) {
    return typeof value === 'string' && /(?:^|\/)images\/uploads\//.test(value);
  }

  function generatedImagePath(value, width) {
    const normalized = String(value).replace(/^\.\.\//, '/').replace(/^\//, '');
    const relative = normalized.replace(/^images\//, '');
    const extension = path.extname(relative);
    const stem = relative.slice(0, -extension.length);
    return `/images/generated/${stem}-${width}.webp`;
  }

  eleventyConfig.addFilter('galleryThumbnail', function (photo) {
    if (isUploadedImage(photo && photo.full)) return generatedImagePath(photo.full, 720);
    return photo && (photo.thumbnail || photo.full);
  });

  eleventyConfig.addFilter('galleryFull', function (photo) {
    if (isUploadedImage(photo && photo.full)) return generatedImagePath(photo.full, 1920);
    return photo && photo.full;
  });

  eleventyConfig.addFilter('gallerySrcset', function (photo) {
    if (isUploadedImage(photo && photo.full)) {
      return [720, 1440, 1920]
        .map(function (width) { return `${generatedImagePath(photo.full, width)} ${width}w`; })
        .join(', ');
    }
    const thumbnail = photo && (photo.thumbnail || photo.full);
    return `${thumbnail} 720w, ${photo.full} 1440w`;
  });

  // Google Ads (gtag.js) — injected into every built page's <head>.
  const GOOGLE_ADS_ID = 'AW-18421882465';
  const GOOGLE_ADS_SNIPPET = [
    '<!-- Google tag (gtag.js) -->',
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"></script>`,
    '<script>',
    '  window.dataLayer = window.dataLayer || [];',
    '  function gtag(){dataLayer.push(arguments);}',
    "  gtag('js', new Date());",
    `  gtag('config', '${GOOGLE_ADS_ID}');`,
    '</script>'
  ].join('\n  ');

  eleventyConfig.addTransform('googleAds', function (content) {
    const outputPath = this.page && this.page.outputPath;
    if (!outputPath || !String(outputPath).endsWith('.html')) return content;
    if (content.includes(GOOGLE_ADS_ID)) return content;
    return content.replace(/<head(\s[^>]*)?>/i, function (match) {
      return `${match}\n  ${GOOGLE_ADS_SNIPPET}`;
    });
  });

  eleventyConfig.on('eleventy.after', async function ({ dir }) {
    const outputDir = dir && dir.output ? dir.output : '_site';
    const fs = require('node:fs/promises');
    await fs.writeFile(path.join(outputDir, '.nojekyll'), '');
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['html', 'njk', 'md']
  };
};
