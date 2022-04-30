import { readFileSync, existsSync, writeFileSync } from 'fs';

export function fileExists(filePath: string) {
  try {
    return !!existsSync(filePath);
  } catch (err) {
    return false;
  }
}

export function loadFileJSON<R = any>(path: string): R {
  if (fileExists(path)) {
    try {
      const data = readFileSync(path, { encoding: 'utf-8' }) as string;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveFileJSON(path: string, data: any): boolean {
  try {
    writeFileSync(path, JSON.stringify(data), { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}
