const fs = require('fs');
const path = require('path');

const { version, name } = require('../package.json');

function start() {
  const context = `/**
 * NÃO MODIFICAR: Arquivo criado por script automatizado
 * - './scripts/release.js'
 */
export const appVersion = '${version}';
export const appName = '${name}';
`;
  const filename = path.resolve(__dirname, '../', 'src/config', 'app.ts');
  fs.writeFileSync(filename, context);
  console.log('release finish');
}

start();
