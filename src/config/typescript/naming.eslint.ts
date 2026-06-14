import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import { namingConventionRule } from 'eslint-config-naming';
import tseslint from 'typescript-eslint';

/**
 * Full English words that `eslint-config-naming`'s abbreviation denylist
 * incorrectly forbids. `info` is the standard log-level method name
 * (`console`/`pino`/`winston`); `data` is an everyday full word. Reclaiming
 * them keeps the rest of the denylist intact.
 * @see fix-consumer-stack-defects (rule-policy-coherence)
 */
const RECLAIMED_WORDS = new Set(['info', 'data']);

/**
 * Rewrites a denylist alternation of the form `^(a|b|...|info|...)$`, dropping
 * the reclaimed words. Left untouched if it is not such an alternation or holds
 * none of the reclaimed words.
 * @param regex - The original custom-regex source string.
 * @returns The regex source with reclaimed words removed.
 */
function stripReclaimedWords(regex: string): string {
  if (!regex.startsWith('^(') || !regex.endsWith(')$')) {
    return regex;
  }

  const tokens = regex.slice(2, -2).split('|');

  if (!tokens.some((token) => RECLAIMED_WORDS.has(token))) {
    return regex;
  }

  return `^(${tokens.filter((token) => !RECLAIMED_WORDS.has(token)).join('|')})$`;
}

/**
 * Clones `eslint-config-naming`'s naming-convention rule, reclaiming a few full
 * English words from the abbreviation denylist carried by its `match: false`
 * selectors.
 * @returns The patched `@typescript-eslint/naming-convention` rule entry.
 */
function buildNamingConventionRule(): Linter.RuleEntry {
  const patched = namingConventionRule.map((element) => {
    // Only the `match: false` selectors carry the abbreviation denylist; leave
    // the severity string and the positive-match selectors untouched.
    if (typeof element === 'string' || !('custom' in element) || element.custom.match) {
      return element;
    }

    return { ...element, custom: { ...element.custom, regex: stripReclaimedWords(element.custom.regex) } };
  });

  return patched as unknown as Linter.RuleEntry;
}

/**
 * @description Naming convention rules via eslint-config-naming, scoped to TypeScript files,
 * with a few full English words reclaimed from the abbreviation denylist.
 * @author Dmytro Vakulenko
 * @see https://github.com/DrSmile444/eslint-config-naming
 */
export default defineConfig({
  files: ['**/*.{ts,tsx,mts,cts}'],
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: {
    '@typescript-eslint/naming-convention': buildNamingConventionRule(),
  },
});
