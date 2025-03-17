/**
 * Test runner for loading state tests
 * 
 * This script can be run to specifically test the loading states across the application.
 * 
 * Usage:
 * npm run test -- --dir src/components/__tests__
 */

import { spawnSync } from 'child_process';

// List of test files specifically related to loading states
const loadingTests = [
  'src/components/__tests__/ResidentManager.test.tsx',
  'src/components/__tests__/MailboxLabelsViewer.test.tsx',
  'src/components/ui/__tests__/tabs.test.tsx'
];

console.log('Running loading state tests...');

// Run each test individually
loadingTests.forEach(testFile => {
  console.log(`\nTesting: ${testFile}`);
  
  const result = spawnSync('npx', ['vitest', 'run', testFile], {
    stdio: 'inherit',
    shell: true
  });
  
  if (result.status !== 0) {
    console.error(`Test failed: ${testFile}`);
    process.exit(1);
  }
});

console.log('\nAll loading state tests passed!'); 