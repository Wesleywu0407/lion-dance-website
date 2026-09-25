import path from 'node:path';
import { build } from 'esbuild';

// Keep the editable modules in css/, but serve one minified stylesheet.
// Images remain passthrough assets; resolve their URLs relative to the source
// module before moving the CSS into the root stylesheet.
export async function buildStyles(outputDir, projectDir = process.cwd()) {
  return build({
    absWorkingDir: projectDir,
    entryPoints: ['css/style.css'],
    outfile: path.resolve(outputDir, 'css/style.css'),
    bundle: true,
    minify: true,
    target: ['chrome90', 'firefox90', 'safari15'],
    legalComments: 'none',
    plugins: [{
      name: 'preserve-public-asset-urls',
      setup(context) {
        context.onResolve({ filter: /.*/ }, args => {
          if (args.kind !== 'url-token') return;
          if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(args.path)) {
            return { path: args.path, external: true };
          }
          const importer = path.relative(projectDir, args.importer).split(path.sep).join('/');
          const url = new URL(args.path, `https://assets.invalid/${importer}`);
          return { path: `${url.pathname}${url.search}${url.hash}`, external: true };
        });
      }
    }]
  });
}
