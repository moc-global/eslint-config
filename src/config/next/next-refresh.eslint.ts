import { defineConfig } from 'eslint/config';
import reactRefresh from 'eslint-plugin-react-refresh';

/** Pages Router export names (data fetching, page/route config, web-vitals hook). */
const PAGES_ROUTER_EXPORT_NAMES = [
  'getStaticProps',
  'getServerSideProps',
  'getStaticPaths',
  'getInitialProps',
  'config',
  'reportWebVitals',
];

/**
 * App Router export names allowed alongside a component, as a hardcoded fallback.
 * The authoritative list is read from the plugin's built-in `next` preset (see
 * `builtinNextAllowExportNames`); this fallback guarantees coverage even if the
 * preset's shape ever changes. Both are merged and de-duplicated below.
 */
const APP_ROUTER_EXPORT_NAMES_FALLBACK = [
  'experimental_ppr',
  'dynamic',
  'dynamicParams',
  'revalidate',
  'fetchCache',
  'runtime',
  'preferredRegion',
  'maxDuration',
  'metadata',
  'generateMetadata',
  'viewport',
  'generateViewport',
  'generateImageMetadata',
  'generateSitemaps',
  'generateStaticParams',
];

/**
 * Reads `allowExportNames` from `eslint-plugin-react-refresh`'s built-in `next`
 * preset so the App Router list stays in sync if the plugin adds new exports.
 * @returns The preset's allowed export names, or an empty array if unavailable.
 */
function builtinNextAllowExportNames(): string[] {
  const config = reactRefresh.configs.next as { rules?: Record<string, unknown> };
  const rule = config.rules?.['react-refresh/only-export-components'];
  const options = Array.isArray(rule) ? (rule[1] as { allowExportNames?: string[] } | undefined) : undefined;

  return options?.allowExportNames ?? [];
}

/** App Router (synced + fallback) plus Pages Router export names, de-duplicated. */
const ALLOW_EXPORT_NAMES = [
  ...new Set([...builtinNextAllowExportNames(), ...APP_ROUTER_EXPORT_NAMES_FALLBACK, ...PAGES_ROUTER_EXPORT_NAMES]),
];

/**
 * @description Next.js Fast Refresh export conventions. Next route files
 * legitimately export non-component values alongside the default component
 * (App Router: `metadata`, `generateStaticParams`, …; Pages Router:
 * `getServerSideProps`, …). This allows both routers' export names so
 * `react-refresh/only-export-components` does not flag them. The pristine React
 * stack no longer owns this rule, so the Next stack sets it here.
 * @author Dmytro Vakulenko
 * @see https://github.com/ArnaudBarre/eslint-plugin-react-refresh
 */
export default defineConfig([
  {
    name: 'next/react-refresh',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': ['error', { allowExportNames: ALLOW_EXPORT_NAMES }],
    },
  },
]);
