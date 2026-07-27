module.exports = {
  eleventyComputed: {
    permalink: function (data) {
      const stem = data.page.filePathStem;
      if (/\.(?:js|css)$/.test(stem)) return stem.replace(/^\//, '');
      return stem === '/index' ? 'index.html' : `${stem.replace(/^\//, '')}.html`;
    }
  }
};
