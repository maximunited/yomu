const { PrismaClient } = require("@prisma/client");

console.log("🔍 Manual Verification Script for Page Headers");
console.log("=============================================\n");

// Test 1: Check if all required pages exist
const pages = [
  "src/app/about/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/contact/page.tsx",
];

const fs = require("fs");
const path = require("path");

console.log("✅ Checking if all pages exist:");
pages.forEach((page) => {
  const exists = fs.existsSync(page);
  console.log(`   ${exists ? "✅" : "❌"} ${page}`);
});

// Test 2: Check if PageHeader component exists
console.log("\n✅ Checking PageHeader component:");
const pageHeaderExists = fs.existsSync("src/components/PageHeader.tsx");
console.log(
  `   ${pageHeaderExists ? "✅" : "❌"} src/components/PageHeader.tsx`,
);

// Test 3: Check if translation keys exist
console.log("\n✅ Checking translation keys:");
const translationKeys = [
  "about",
  "terms",
  "privacy",
  "contact",
  "back",
  "contactInformation",
  "sendMessage",
  "phone",
  "address",
  "workingHours",
  "chooseSubject",
  "technicalSupport",
  "improvementSuggestion",
  "bugReport",
  "generalQuestion",
  "writeYourMessageHere",
  "enterYourFullName",
  "yourEmail",
  "allRightsReserved",
];

const translationsFile = fs.readFileSync("src/lib/translations.ts", "utf8");
const missingKeys = translationKeys.filter(
  (key) => !translationsFile.includes(key),
);

if (missingKeys.length === 0) {
  console.log("   ✅ All required translation keys are present");
} else {
  console.log("   ❌ Missing translation keys:", missingKeys);
}

// Test 4: Check if components use proper imports
console.log("\n✅ Checking component imports:");
const components = [
  "src/components/PageHeader.tsx",
  "src/components/LanguageSelector.tsx",
  "src/components/LanguageSwitcher.tsx",
];

components.forEach((component) => {
  if (fs.existsSync(component)) {
    const content = fs.readFileSync(component, "utf8");
    const hasUseLanguage = content.includes("useLanguage");
    const hasUseDarkMode = content.includes("useDarkMode");
    console.log(`   ${component}:`);
    console.log(`     ${hasUseLanguage ? "✅" : "❌"} useLanguage import`);
    console.log(`     ${hasUseDarkMode ? "✅" : "❌"} useDarkMode import`);
  }
});

// Test 5: Check for dark mode classes
console.log("\n✅ Checking dark mode implementation:");
pages.forEach((page) => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, "utf8");
    const hasDarkModeClasses =
      content.includes("isDarkMode") && content.includes("bg-gray-900");
    console.log(
      `   ${page}: ${hasDarkModeClasses ? "✅" : "❌"} Dark mode classes`,
    );
  }
});

// Test 6: Check for translation usage
console.log("\n✅ Checking translation usage:");
pages.forEach((page) => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, "utf8");
    const hasTranslationUsage =
      content.includes("t(") && content.includes("useLanguage");
    console.log(
      `   ${page}: ${hasTranslationUsage ? "✅" : "❌"} Translation usage`,
    );
  }
});

console.log("\n🎉 Manual verification complete!");
console.log("\n📋 Next steps for testing:");
console.log("1. Start the development server: npm run dev");
console.log("2. Visit each page and verify:");
console.log("   - Language switcher is present and functional");
console.log("   - Dark mode toggle works and changes styling");
console.log("   - Back button navigates correctly");
console.log("   - All text is properly translated");
console.log("   - Dark mode styling is applied correctly");
console.log("3. Test language switching on each page");
console.log("4. Test dark mode toggle on each page");
console.log("5. Verify responsive design on mobile devices");
