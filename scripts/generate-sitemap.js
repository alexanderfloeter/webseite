const fs = require('fs');
const baseUrl = 'https://kleine-musikschule.de';

const html = fs.readFileSync('index.html', 'utf8');
const ids = Array.from(html.matchAll(/<article id="([^"]+)"/g)).map(m => m[1]);
const urls = [''].concat(ids.map(id => `#${id}`));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${baseUrl}/${u}</loc></url>`).join('\n') +
  '\n</urlset>\n';

fs.writeFileSync('sitemap.xml', xml);
