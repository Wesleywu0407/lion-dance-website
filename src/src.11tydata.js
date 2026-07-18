module.exports = {
  eleventyComputed: {
    permalink: function (data) {
      const stem = data.page.filePathStem;
      if (stem === '/script.js') return 'script.js';
      return stem === '/index' ? 'index.html' : `${stem.replace(/^\//, '')}.html`;
    }
  }
};
