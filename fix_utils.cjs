const fs = require('fs');
let content = fs.readFileSync('src/lib/utils.ts', 'utf8');
content = content.replace("cell.replace", "String(cell).replace");
content = content.replace("cell.search", "String(cell).search");
fs.writeFileSync('src/lib/utils.ts', content);
