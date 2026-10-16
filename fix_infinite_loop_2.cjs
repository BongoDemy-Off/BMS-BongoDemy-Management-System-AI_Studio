const fs = require('fs');

function replaceAllFile(path, search, replace) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(path, content);
  }
}

// Any other occurrences?
