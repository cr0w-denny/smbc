import { rmSync } from 'fs';
import { existsSync } from 'fs';

const distPath = './dist';
const buildInfoPath = './tsconfig.tsbuildinfo';

if (existsSync(distPath)) {
  console.log('Removing dist directory...');
  rmSync(distPath, { recursive: true, force: true });
  console.log('dist directory removed');
}

if (existsSync(buildInfoPath)) {
  console.log('Removing tsconfig.tsbuildinfo...');
  rmSync(buildInfoPath);
  console.log('tsconfig.tsbuildinfo removed');
}

console.log('Clean completed');