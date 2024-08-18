const fs = require('fs');
const path = require('path');
const marked = require('markdown-it')({
  html: true,
});
const nunjucks = require('nunjucks');
// Set up Nunjucks environment
const templatesDir = path.join(__dirname, 'templates');
const outputDir = path.join(__dirname, 'output');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const env = nunjucks.configure(templatesDir, {
  autoescape: true,
});
@@ -24,9 +30,10 @@ function convertMarkdownToHTML(markdown) {

function processWikiLinks(content) {
  const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\.md\)/g;
  return content.replace(wikiLinkRegex, (match, text, link) => {
    return `<a href="${link}.html">${text}</a>`;
  });
}

function extractTags(content) {
@@ -42,7 +49,7 @@ function getFilesInDirectory(directory) {
  });
}

function generateFileExplorerPage(files) {
  const explorerTemplate = `
<!DOCTYPE html>
<html lang="en">
@@ -55,20 +62,61 @@ function generateFileExplorerPage(files) {
</head>
<body>
<div id="wrapper">
  <header>
    <h1><a href="/">Explorer</a></h1>
  </header>
  <main>
    <ol>
      ${files.map(file => {
        const fileName = path.basename(file, path.extname(file));
        return `<li><a href="${fileName}.html">${file}</a></li>`;
      }).join('')}
    </ol>
  </main>
  <footer>
    <div id="fl"><a href="http://foollovers.com" target="_blank">designed</a></div>
  </footer>
</div>
<a href="#" id="pagetop">▲top</a>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
@@ -81,89 +129,62 @@ function generateFileExplorerPage(files) {
  fs.writeFileSync(path.join(outputDir, 'explorer.html'), explorerTemplate);
}

const outputHtml = nunjucks.render('page-template.html', {
  content: convertMarkdownToHTML(processedContent),
  title: pageName,
  tags: tags  // Pass the tags to the template
});

function generateTagPages(tagMap) {
  Object.keys(tagMap).forEach(tag => {
    const pages = tagMap[tag];
    const tagPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/style.css">
  <meta charset="UTF-8">
  <title>Tag: ${tag}</title>
</head>
<body>
<div id="wrapper">
  <header>
    <h1>Tag: ${tag}</h1>
  </header>
  <main>
  <strong><p>Pages tagged with ${tag}</p></strong>
    <ul>
      ${pages.map(page => `<li><a href="${page}.html">${page}</a></li>`).join('')}
    </ul>
  </main>
  <footer>
    <div id="fl"><a href="http://foollovers.com" target="_blank">designed</a></div>
  </footer>
</div>
<a href="#" id="pagetop">▲top</a>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="/jquery.scroll.js"></script>
<script src="/jquery.toggle.js"></script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(outputDir, `tag-${tag}.html`), tagPageContent);
  });
}

function generatePages() {
  const pagesDir = path.join(__dirname, 'pages');
  const files = getFilesInDirectory(pagesDir);
  const tagMap = {};

  files.forEach((fileName) => {
    const filePath = path.join(pagesDir, fileName);

    if (fs.statSync(filePath).isFile() && path.extname(fileName) === '.md') {
      const pageContent = fs.readFileSync(filePath, 'utf-8');
      const tags = extractTags(pageContent);

      // Update tag map
      tags.forEach(tag => {
        if (!tagMap[tag]) {
          tagMap[tag] = [];
        }
        tagMap[tag].push(path.basename(fileName, path.extname(fileName)));
      });

      const processedContent = processWikiLinks(pageContent);
      const pageName = path.basename(fileName, path.extname(fileName));
      const outputHtml = nunjucks.render('page-template.html', {
        content: convertMarkdownToHTML(processedContent),
        title: pageName,
      });

      const outputPath = path.join(outputDir, `${pageName}.html`);
      fs.writeFileSync(outputPath, outputHtml);
    }
  });

  // Generate the file explorer page
  generateFileExplorerPage(files);

  // Generate tag pages
  generateTagPages(tagMap);
}

generatePages();
