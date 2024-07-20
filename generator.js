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

function convertMarkdownToHTML(markdown) {
  return marked.render(markdown);
}

function processWikiLinks(content) {
  const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\.md\)/g;
  const processedContent = content.replace(wikiLinkRegex, (match, text, link) => {
    return `<a href="${link}.html">${text}</a>`;
  });
  return processedContent;
}

function getFilesInDirectory(directory) {
  return fs.readdirSync(directory).filter(file => {
    const filePath = path.join(directory, file);
    return fs.statSync(filePath).isFile() && path.extname(file) === '.md';
  });
}

function generateFileExplorerPage(files, outputDir) {
  const explorerTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/style.css">
  <meta charset="UTF-8">
  <title>File Explorer</title>
</head>
<body>
  <h1>File Explorer</h1>
  <ul>
    ${files.map(file => {
      const fileName = path.basename(file, path.extname(file));
      return `<li><a href="${fileName}.html">${file}</a></li>`;
    }).join('')}
  </ul>
</body>
</html>
  `;

  fs.writeFileSync(path.join(outputDir, 'file-explorer.html'), explorerTemplate);
}

function generatePages() {
  const pagesDir = path.join(__dirname, 'pages');

  // Get list of files
  const files = getFilesInDirectory(pagesDir);

  // Generate each page
  files.forEach((fileName) => {
    const filePath = path.join(pagesDir, fileName);

    if (fs.statSync(filePath).isFile() && path.extname(fileName) === '.md') {
      const pageContent = fs.readFileSync(filePath, 'utf-8');

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
  generateFileExplorerPage(files, outputDir);
}

generatePages();
