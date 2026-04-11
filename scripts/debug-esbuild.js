const fs = require('fs');
const esbuild = require('../node_modules/esbuild');
const path = require('path');
const filePath = path.resolve(__dirname, '../src/app/pages/accountant/employees.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const ends = [430, 440, 450, 460, 464, 465, 470];
for (const end of ends) {
  const src = lines.slice(0, end).join('\n');
  try {
    esbuild.transformSync(src, { loader: 'tsx' });
    console.log('OK end', end);
  } catch (e) {
    console.log('ERROR end', end, e.message.replace(/\n/g, ' '));
  }
}
