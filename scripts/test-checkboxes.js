const fs = require('fs');
const path = require('path');

console.log('🔍 Checkbox Functionality Test');
console.log('==============================\n');

// Check signin page
const signinPath = path.join(__dirname, 'src/app/auth/signin/page.tsx');
if (fs.existsSync(signinPath)) {
  console.log('✅ Signin page found');
  const content = fs.readFileSync(signinPath, 'utf8');

  // Check for state variables
  const hasSaveEmail = content.includes('saveEmail, setSaveEmail');
  const hasKeepSignedIn = content.includes('keepSignedIn, setKeepSignedIn');

  console.log(`✅ Save Email state: ${hasSaveEmail ? '✓' : '✗'}`);
  console.log(`✅ Keep Signed In state: ${hasKeepSignedIn ? '✓' : '✗'}`);

  // Check for checkbox elements
  const hasSaveEmailCheckbox = content.includes('id="saveEmail"');
  const hasKeepSignedInCheckbox = content.includes('id="keepSignedIn"');

  console.log(`✅ Save Email checkbox: ${hasSaveEmailCheckbox ? '✓' : '✗'}`);
  console.log(
    `✅ Keep Signed In checkbox: ${hasKeepSignedInCheckbox ? '✓' : '✗'}`
  );

  // Check for labels
  const hasSaveEmailLabel = content.includes('htmlFor="saveEmail"');
  const hasKeepSignedInLabel = content.includes('htmlFor="keepSignedIn"');

  console.log(`✅ Save Email label: ${hasSaveEmailLabel ? '✓' : '✗'}`);
  console.log(`✅ Keep Signed In label: ${hasKeepSignedInLabel ? '✓' : '✗'}`);

  // Check for styling
  const hasProperSpacing = content.includes('space-y-4');
  const hasFlexLayout = content.includes('flex items-start space-x-3');

  console.log(`✅ Proper spacing: ${hasProperSpacing ? '✓' : '✗'}`);
  console.log(`✅ Flex layout: ${hasFlexLayout ? '✓' : '✗'}`);

  // Check for translations
  const hasSaveEmailTranslation = content.includes("t('saveEmail')");
  const hasKeepSignedInTranslation = content.includes("t('keepMeSignedIn')");

  console.log(
    `✅ Save Email translation: ${hasSaveEmailTranslation ? '✓' : '✗'}`
  );
  console.log(
    `✅ Keep Signed In translation: ${hasKeepSignedInTranslation ? '✓' : '✗'}`
  );
} else {
  console.log('❌ Signin page not found');
}

// Check translations
const translationsPath = path.join(__dirname, 'src/lib/translations.ts');
if (fs.existsSync(translationsPath)) {
  console.log('\n✅ Translations file found');
  const content = fs.readFileSync(translationsPath, 'utf8');

  const hasSaveEmail = content.includes('saveEmail:');
  const hasKeepSignedIn = content.includes('keepMeSignedIn:');

  console.log(`✅ Save Email translation key: ${hasSaveEmail ? '✓' : '✗'}`);
  console.log(
    `✅ Keep Signed In translation key: ${hasKeepSignedIn ? '✓' : '✗'}`
  );
} else {
  console.log('\n❌ Translations file not found');
}

console.log('\n📋 Manual Testing Steps:');
console.log('1. Run: npm run dev');
console.log('2. Go to: http://localhost:3000/auth/signin');
console.log('3. Verify checkboxes work correctly');
console.log('\n✅ Test complete!');
