const fs = require('fs');

const data = JSON.parse(fs.readFileSync('vulnerability-report.json'));

console.log('\n📋 Vulnerable Packages:\n');
console.log('Package Name                    | Severity  | Fix Available');
console.log('--------------------------------|-----------|-------------');

Object.entries(data.vulnerabilities).forEach(([name, info]) => {
  const nameCol = name.padEnd(30);
  const sevCol = info.severity.toUpperCase().padEnd(9);
  const fixCol = info.fixAvailable ? '✅ Yes' : '❌ No';
  console.log(`${nameCol} | ${sevCol} | ${fixCol}`);
});

console.log('\n');
