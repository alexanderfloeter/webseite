const fs = require('fs');

function minifyCSS(css) {
  return css
    .replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .trim();
}

function minifyJS(js) {
  return js
    .replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g, '')
    .replace(/\/\/.*\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}():;,])\s*/g, '$1')
    .trim();
}

// CSS
try {
  const css = fs.readFileSync('assets/css/main.css', 'utf8');
  fs.writeFileSync('assets/css/main.min.css', minifyCSS(css));
} catch (e) {
  console.error('CSS minify failed', e);
}

// JS
['util', 'main'].forEach(file => {
  try {
    const js = fs.readFileSync(`assets/js/${file}.js`, 'utf8');
    fs.writeFileSync(`assets/js/${file}.min.js`, minifyJS(js));
  } catch (e) {
    console.error(`JS minify failed for ${file}`, e);
  }
});
