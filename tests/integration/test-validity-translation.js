// Test script to verify validity translation is working
const fs = require('fs');
const path = require('path');

// Mock the translation function
const mockTranslations = {
  validityEntireMonth: 'חודש שלם',
  validityExactDate: 'יום אחד',
  validityWeekBeforeAfter: 'שבועיים',
  validityWeekend: 'סוף שבוע',
  validity30Days: '30 ימים',
  validity7DaysBefore: '7 ימים לפני',
  validity7DaysAfter: '7 ימים אחרי',
  validity3DaysBefore: '3 ימים לפני',
  validity3DaysAfter: '3 ימים אחרי',
  validityLimitedPeriod: 'תקופה מוגבלת'
};

function mockT(key) {
  return mockTranslations[key] || key;
}

// Test the getValidityDisplayText function
function getValidityDisplayText(validityType) {
  const VALIDITY_TYPES = {
    "birthday_exact_date": { displayTextKey: "validityExactDate" },
    "birthday_entire_month": { displayTextKey: "validityEntireMonth" },
    "birthday_week_before_after": { displayTextKey: "validityWeekBeforeAfter" },
    "birthday_weekend": { displayTextKey: "validityWeekend" },
    "birthday_30_days": { displayTextKey: "validity30Days" },
    "birthday_7_days_before": { displayTextKey: "validity7DaysBefore" },
    "birthday_7_days_after": { displayTextKey: "validity7DaysAfter" },
    "birthday_3_days_before": { displayTextKey: "validity3DaysBefore" },
    "birthday_3_days_after": { displayTextKey: "validity3DaysAfter" }
  };
  
  const normalizedType = validityType;
  return VALIDITY_TYPES[normalizedType]?.displayTextKey || "validityLimitedPeriod";
}

// Test the getValidityText function (simulating the dashboard)
function getValidityText(benefit) {
  const key = getValidityDisplayText(benefit.validityType);
  return mockT(key);
}

// Test cases
const testCases = [
  { validityType: "birthday_entire_month", expected: "חודש שלם" },
  { validityType: "birthday_exact_date", expected: "יום אחד" },
  { validityType: "birthday_week_before_after", expected: "שבועיים" },
  { validityType: "unknown_type", expected: "תקופה מוגבלת" }
];

console.log("Testing validity translation...");
console.log("=".repeat(50));

testCases.forEach((testCase, index) => {
  const result = getValidityText({ validityType: testCase.validityType });
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: ${testCase.validityType}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got: ${result}`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

console.log("Test completed!"); 