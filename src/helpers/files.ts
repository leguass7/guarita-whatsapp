import fs from 'fs';

export function fileExists(filePath: string) {
  try {
    return !!fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}
