# Trailing Whitespace Prevention Rules

## Mandatory Pre-Edit Checks

Before ANY file edit, I MUST verify:

1. **No trailing spaces at end of lines**
2. **Files end with exactly one newline**
3. **No tabs mixed with spaces inconsistently**

## Edit Tool Usage Rules

When using Edit or MultiEdit tools:

### Rule 1: Strip Trailing Whitespace

- Always ensure `old_string` and `new_string` have NO trailing spaces
- When copying from Read output, manually remove any trailing whitespace
- Double-check line endings before submitting edit

### Rule 2: Consistent Line Endings

- Ensure `new_string` ends properly (newline where expected, no trailing whitespace)
- For multi-line strings, verify each line ends cleanly

### Rule 3: Verification Step

- After crafting edit parameters, mentally verify:
  - ✅ No trailing spaces in old_string
  - ✅ No trailing spaces in new_string
  - ✅ Proper line ending handling

## Common Failure Patterns to Avoid

❌ **BAD**: Copying from Read output with trailing spaces
❌ **BAD**: Adding spaces after final character in line
❌ **BAD**: Inconsistent indentation (tabs vs spaces)

✅ **GOOD**: Clean, trimmed strings
✅ **GOOD**: Consistent indentation
✅ **GOOD**: Proper newline handling

## Emergency Fix Command

If whitespace issues persist:

```bash
# Remove trailing whitespace from all source files
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | xargs sed -i 's/[[:space:]]*$//'
```

## Pre-Commit Hook Understanding

The hook `trim trailing whitespace` will:

- Remove any trailing spaces/tabs from line ends
- This modifies files during commit
- If files are modified, commit fails and requires re-staging

**Prevention is better than fixing!**
