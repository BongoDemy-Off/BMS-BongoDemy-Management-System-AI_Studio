const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace const { a, b, c } = useAppContext();
  // with const a = useAppContext(s => s.a); const b = useAppContext(s => s.b); etc.
  const regex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useAppContext\(\)\s*;/g;
  
  content = content.replace(regex, (match, props) => {
    changed = true;
    const vars = props.split(',').map(v => v.trim()).filter(v => v.length > 0);
    return vars.map(v => {
      // handle aliases: const { currentUser: user } = useAppContext();
      if (v.includes(':')) {
        const [orig, alias] = v.split(':').map(s => s.trim());
        return `const ${alias} = useAppContext(s => s.${orig});`;
      }
      return `const ${v} = useAppContext(s => s.${v});`;
    }).join('\n  ');
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refactored', file);
  }
});
