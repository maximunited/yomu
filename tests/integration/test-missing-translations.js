const fs = require('fs');
const path = require('path');

// Simple utility to find files recursively
function findFiles(dir, extension) {
  const files = [];
  
  function traverseDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverseDir(fullPath);
      } else if (stat.isFile() && item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDir(dir);
  return files;
}

async function testMissingTranslations() {
  try {
    console.log('🧪 Testing for Missing Translations...\n');

    // 1. Load translation files
    console.log('1️⃣ Loading translation definitions:');
    
    const translationsPath = path.join(__dirname, '../../src/lib/translations.ts');
    const translationsContent = fs.readFileSync(translationsPath, 'utf8');
    
    // Extract Hebrew and English translation keys
    const hebrewKeyMatches = translationsContent.match(/he:\s*{([\s\S]*?)},\s*en:/);
    const englishKeyMatches = translationsContent.match(/en:\s*{([\s\S]*?)}\s*,?\s*};/);
    
    if (!hebrewKeyMatches || !englishKeyMatches) {
      console.log('❌ Could not parse translation file structure');
      return;
    }

    const hebrewKeys = new Set();
    const englishKeys = new Set();
    
    // Extract keys from Hebrew section
    const hebrewSection = hebrewKeyMatches[1];
    const hebrewKeyRegex = /(\w+):\s*['`"][^'`"]*['`"]/g;
    let match;
    while ((match = hebrewKeyRegex.exec(hebrewSection)) !== null) {
      hebrewKeys.add(match[1]);
    }
    
    // Extract keys from English section
    const englishSection = englishKeyMatches[1];
    const englishKeyRegex = /(\w+):\s*['`"][^'`"]*['`"]/g;
    while ((match = englishKeyRegex.exec(englishSection)) !== null) {
      englishKeys.add(match[1]);
    }

    console.log(`Hebrew keys found: ${hebrewKeys.size}`);
    console.log(`English keys found: ${englishKeys.size}`);

    // 2. Check for missing keys between languages
    console.log('\n2️⃣ Checking for missing keys between languages:');
    
    const missingInEnglish = [...hebrewKeys].filter(key => !englishKeys.has(key));
    const missingInHebrew = [...englishKeys].filter(key => !hebrewKeys.has(key));

    if (missingInEnglish.length > 0) {
      console.log('❌ Keys missing in English:');
      missingInEnglish.forEach(key => console.log(`  - ${key}`));
    }

    if (missingInHebrew.length > 0) {
      console.log('❌ Keys missing in Hebrew:');
      missingInHebrew.forEach(key => console.log(`  - ${key}`));
    }

    if (missingInEnglish.length === 0 && missingInHebrew.length === 0) {
      console.log('✅ All translation keys are present in both languages');
    }

    // 3. Find all usage of translation keys in code
    console.log('\n3️⃣ Scanning codebase for translation usage:');
    
    const srcDir = path.join(__dirname, '../../src');
    const codeFiles = [
      ...findFiles(srcDir, '.tsx'),
      ...findFiles(srcDir, '.ts'),
      ...findFiles(srcDir, '.js'),
      ...findFiles(srcDir, '.jsx')
    ]
      .filter(file => !file.includes('translations.ts'))
      // Ignore seed data files; they contain domain content, not UI strings
      .filter(file => !file.replace(/\\/g, '/').includes('/app/api/seed/'));

    console.log(`Scanning ${codeFiles.length} code files...`);

    const usedTranslationKeys = new Set();
    const hardcodedTexts = new Set();
    const possibleMissingTranslations = new Set();

    // Patterns to find translation usage
    // Match calls to the i18n function named exactly `t( ... )`
    // Use a left boundary that is not part of an identifier/dot to avoid matching in words like `split(` or `const(`
    const translationPatterns = [
      /(?:^|[^A-Za-z0-9_$.])t\s*\(\s*['"`](\w+)['"`]\s*\)/g,
    ];

    // Patterns to find hardcoded Hebrew/English text that might need translation
    const hardcodedPatterns = [
      /['"`]([^'"`]*[\u0590-\u05FF][^'"`]*)['"`]/g, // Hebrew text
      /['"`]((?:Add|Edit|Delete|Save|Cancel|Search|Filter|Show|Hide|Create|Update|Remove|Select|Choose|Upload|Download|Login|Logout|Sign|Register|Submit|Send|Back|Next|Previous|Continue|Finish|Start|Stop|Play|Pause|Close|Open|Help|About|Contact|Settings|Profile|Dashboard|Home|Loading|Error|Success|Warning|Info|Yes|No|OK|Apply|Reset|Clear|Refresh|Copy|Cut|Paste|Print|Export|Import|Share|Like|Favorite|Comment|Reply|Report|Block|Follow|Unfollow)[^'"`]*)['"`]/gi, // Common English words that should be translated
    ];

    for (const file of codeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(srcDir, file);

      // Find translation key usage
      for (const pattern of translationPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          usedTranslationKeys.add(match[1]);
        }
      }

      // Find potential hardcoded text
      for (const pattern of hardcodedPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const text = match[1].trim();
          if (text.length > 2 && !text.includes('http') && !text.includes('@') && !text.includes('.') && !text.includes('/')) {
            hardcodedTexts.add(`${relativePath}: "${text}"`);
          }
        }
      }

      // Look for specific Hebrew text patterns that might need translation
      const hebrewTextMatches = content.match(/['"`][^'"`]*[\u0590-\u05FF][^'"`]*['"`]/g);
      if (hebrewTextMatches) {
        hebrewTextMatches.forEach(match => {
          const text = match.slice(1, -1); // Remove quotes
          if (text.length > 5 && !text.includes('http')) {
            possibleMissingTranslations.add(`${relativePath}: ${match}`);
          }
        });
      }
    }

    console.log(`Found ${usedTranslationKeys.size} translation keys used in code`);

    // 4. Check for unused translation keys
    console.log('\n4️⃣ Checking for unused translation keys:');
    
    const allTranslationKeys = new Set([...hebrewKeys, ...englishKeys]);
    const unusedKeys = [...allTranslationKeys].filter(key => !usedTranslationKeys.has(key));

    if (unusedKeys.length > 0) {
      console.log(`⚠️ Found ${unusedKeys.length} potentially unused translation keys:`);
      unusedKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
      if (unusedKeys.length > 10) {
        console.log(`  ... and ${unusedKeys.length - 10} more`);
      }
    } else {
      console.log('✅ All translation keys appear to be used');
    }

    // 5. Check for missing translations (used keys not in translation file)
    console.log('\n5️⃣ Checking for missing translation definitions:');
    
    const missingDefinitions = [...usedTranslationKeys]
      .filter(key => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) // ignore numeric and non-identifier tokens
      .filter(key => !allTranslationKeys.has(key));

    if (missingDefinitions.length > 0) {
      console.log(`❌ Found ${missingDefinitions.length} translation keys used but not defined:`);
      missingDefinitions.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('✅ All used translation keys are defined');
    }

    // 6. Report hardcoded text that might need translation
    console.log('\n6️⃣ Potential hardcoded text that might need translation:');
    
    if (possibleMissingTranslations.size > 0) {
      console.log(`⚠️ Found ${possibleMissingTranslations.size} potential hardcoded texts:`);
      const sortedTexts = Array.from(possibleMissingTranslations).sort();
      sortedTexts.slice(0, 15).forEach(text => console.log(`  ${text}`));
      if (sortedTexts.length > 15) {
        console.log(`  ... and ${sortedTexts.length - 15} more`);
      }
    } else {
      console.log('✅ No obvious hardcoded text found');
    }

    // 7. Check for specific multi-brand partnership texts
    console.log('\n7️⃣ Checking multi-brand partnership feature translations:');
    
    const partnershipTexts = [
      'כולל גישה ל', // "includes access to"
      'מותגים נוספים', // "additional brands"
      'הצג רשימת מותגים', // "show brand list"
      'includes access to',
      'additional brands',
      'show brand list'
    ];

    const foundPartnershipTexts = [];
    
    for (const file of codeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(srcDir, file);
      
      for (const text of partnershipTexts) {
        const quotedRegex = new RegExp(`["'\-\uFFFF]([^"'\\` + '`' + `]*${text}[^"'\\` + '`' + `]*)["'\-\uFFFF]`); // match text inside any quote
        if (quotedRegex.test(content)) {
          foundPartnershipTexts.push(`${relativePath}: "${text}"`);
        }
      }
    }

    if (foundPartnershipTexts.length > 0) {
      console.log('⚠️ Found hardcoded partnership-related texts:');
      foundPartnershipTexts.forEach(text => console.log(`  ${text}`));
      console.log('\n💡 Consider adding these to translations:');
      console.log('  - includesAccessTo: "כולל גישה ל" / "includes access to"');
      console.log('  - additionalBrands: "מותגים נוספים" / "additional brands"');
      console.log('  - showBrandList: "הצג רשימת מותגים" / "show brand list"');
      console.log('  - partnershipCount: "שותפויות" / "partnerships"');
    } else {
      console.log('✅ No hardcoded partnership texts found');
    }

    // 8. Summary
    console.log('\n8️⃣ Translation Health Summary:');
    
    const issues = [];
    if (missingInEnglish.length > 0) issues.push(`${missingInEnglish.length} keys missing in English`);
    if (missingInHebrew.length > 0) issues.push(`${missingInHebrew.length} keys missing in Hebrew`);
    if (missingDefinitions.length > 0) issues.push(`${missingDefinitions.length} used keys not defined`);
    if (foundPartnershipTexts.length > 0) issues.push(`${foundPartnershipTexts.length} hardcoded partnership texts`);

    if (issues.length === 0) {
      console.log('🎉 Translation system is healthy!');
      console.log('  ✅ All keys present in both languages');
      console.log('  ✅ All used keys are defined');
      console.log('  ✅ No obvious missing translations');
    } else {
      console.log('⚠️ Translation issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('\n🔧 Recommended actions:');
      if (foundPartnershipTexts.length > 0) {
        console.log('  1. Add partnership-related translation keys');
        console.log('  2. Replace hardcoded partnership texts with t() calls');
      }
      if (missingDefinitions.length > 0) {
        console.log('  3. Add missing translation definitions');
      }
      if (missingInEnglish.length > 0 || missingInHebrew.length > 0) {
        console.log('  4. Add missing translations between languages');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMissingTranslations();