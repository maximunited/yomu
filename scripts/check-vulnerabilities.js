#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking for security vulnerabilities...\n');

try {
  // Run npm audit and capture output
  const auditOutput = execSync('npm audit --json', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const audit = JSON.parse(auditOutput);

  console.log('📊 Vulnerability Summary:');
  console.log('========================');
  console.log(`Critical: ${audit.metadata.vulnerabilities.critical || 0}`);
  console.log(`High:     ${audit.metadata.vulnerabilities.high || 0}`);
  console.log(`Moderate: ${audit.metadata.vulnerabilities.moderate || 0}`);
  console.log(`Low:      ${audit.metadata.vulnerabilities.low || 0}`);
  console.log(`Info:     ${audit.metadata.vulnerabilities.info || 0}`);
  console.log(`Total:    ${audit.metadata.vulnerabilities.total || 0}\n`);

  if (audit.metadata.vulnerabilities.total > 0) {
    console.log('🔧 Affected Packages:');
    console.log('====================');

    const vulnerabilities = Object.entries(audit.vulnerabilities || {});
    vulnerabilities.forEach(([name, data]) => {
      console.log(`\n📦 ${name} (${data.severity.toUpperCase()})`);
      console.log(`   Range: ${data.range}`);
      if (data.via && Array.isArray(data.via)) {
        data.via.forEach((v) => {
          if (typeof v === 'object') {
            console.log(`   Issue: ${v.title}`);
            console.log(`   URL: ${v.url}`);
          }
        });
      }
      if (data.fixAvailable) {
        console.log(
          `   ✅ Fix available: ${data.fixAvailable.name}@${data.fixAvailable.version}`
        );
      } else {
        console.log(`   ❌ No fix available yet`);
      }
    });

    console.log('\n\n💡 Recommended Actions:');
    console.log('======================');
    console.log('1. Run: npm audit fix');
    console.log('2. For breaking changes: npm audit fix --force');
    console.log('3. Enable Dependabot Security Updates on GitHub');
    console.log(
      '   Settings → Code security and analysis → Dependabot security updates\n'
    );

    // Save detailed report
    fs.writeFileSync(
      'vulnerability-report.json',
      JSON.stringify(audit, null, 2)
    );
    console.log('📄 Detailed report saved to: vulnerability-report.json\n');
  } else {
    console.log('✅ No vulnerabilities found!\n');
  }

  process.exit(audit.metadata.vulnerabilities.total > 0 ? 1 : 0);
} catch (error) {
  if (error.stdout) {
    try {
      const audit = JSON.parse(error.stdout.toString());
      console.log('⚠️ Vulnerabilities detected (from error output)');

      console.log('\n📊 Summary:');
      console.log(`Critical: ${audit.metadata.vulnerabilities.critical || 0}`);
      console.log(`High:     ${audit.metadata.vulnerabilities.high || 0}`);
      console.log(`Moderate: ${audit.metadata.vulnerabilities.moderate || 0}`);
      console.log(`Low:      ${audit.metadata.vulnerabilities.low || 0}`);
      console.log(`Total:    ${audit.metadata.vulnerabilities.total || 0}\n`);

      // Save report
      fs.writeFileSync(
        'vulnerability-report.json',
        JSON.stringify(audit, null, 2)
      );
      console.log('📄 Report saved to: vulnerability-report.json');
      console.log('\n💡 Run: npm audit fix\n');

      process.exit(1);
    } catch (parseError) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } else {
    console.error('Error running audit:', error.message);
    process.exit(1);
  }
}
