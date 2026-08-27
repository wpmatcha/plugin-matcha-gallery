const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// WordPress Global Mapper for esbuild
const wpGlobalsPlugin = {
  name: 'wp-globals',
  setup(build) {
    const wpPackages = {
      '@wordpress/blocks': 'wp.blocks',
      '@wordpress/block-editor': 'wp.blockEditor',
      '@wordpress/components': 'wp.components',
      '@wordpress/data': 'wp.data',
      '@wordpress/element': 'wp.element',
      '@wordpress/i18n': 'wp.i18n',
      '@wordpress/api-fetch': 'wp.apiFetch',
      '@wordpress/icons': 'wp.icons',
      '@wordpress/primitives': 'wp.primitives',
      '@wordpress/compose': 'wp.compose',
      '@wordpress/hooks': 'wp.hooks',
      'react': 'wp.element',
      'react-dom': 'wp.element',
      'react/jsx-runtime': 'wp.element',
    };

    const keys = Object.keys(wpPackages);
    const filter = new RegExp('^(' + keys.map(k => k.replace('/', '\\/')).join('|') + ')$');

    build.onResolve({ filter }, args => {
      return { path: args.path, namespace: 'wp-global' };
    });

    build.onLoad({ filter: /.*/, namespace: 'wp-global' }, args => {
      const globalVar = wpPackages[args.path];
      return {
        contents: `module.exports = window.${globalVar};`,
        loader: 'js',
      };
    });
  },
};

async function run() {
  console.log('Building Smart Gallery Gutenberg Block...');
  await esbuild.build({
    entryPoints: ['blocks/smart-gallery/index.js'],
    bundle: true,
    outfile: 'build/smart-gallery/index.js',
    format: 'iife',
    loader: { '.js': 'jsx' },
    plugins: [wpGlobalsPlugin],
    jsxFactory: 'window.wp.element.createElement',
    jsxFragment: 'window.wp.element.Fragment',
    target: ['es2020'],
  });

  // Generate block.json in build folder
  const blockJsonRaw = fs.readFileSync(path.join(__dirname, 'blocks/smart-gallery/block.json'), 'utf8');
  const blockJsonObj = JSON.parse(blockJsonRaw);
  blockJsonObj.editorScript = 'file:./index.js';
  blockJsonObj.editorStyle = 'file:./index.css';
  fs.writeFileSync(path.join(__dirname, 'build/smart-gallery/block.json'), JSON.stringify(blockJsonObj, null, 2));

  // Generate index.css
  const cssSrc = path.join(__dirname, 'blocks/smart-gallery/editor.css');
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, path.join(__dirname, 'build/smart-gallery/index.css'));
  }

  // Generate index.asset.php
  const assetPhp = `<?php
return array(
\t'dependencies' => array(
\t\t'wp-blocks',
\t\t'wp-element',
\t\t'wp-block-editor',
\t\t'wp-components',
\t\t'wp-data',
\t\t'wp-i18n',
\t\t'wp-api-fetch',
\t),
\t'version'      => '${Date.now()}',
);
`;
  fs.writeFileSync(path.join(__dirname, 'build/smart-gallery/index.asset.php'), assetPhp);

  console.log('Building Studio UI...');
  await esbuild.build({
    entryPoints: ['studio/src/index.js'],
    bundle: true,
    outfile: 'assets/js/studio.js',
    format: 'iife',
    target: ['es2020'],
  });

  console.log('Build complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
