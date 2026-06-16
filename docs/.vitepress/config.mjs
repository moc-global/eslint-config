import { defineConfig } from 'vitepress';

/**
 * Resolves the VitePress base URL for GitHub Pages.
 * Local dev stays at "/"; in CI the site is a **project page** served from
 * "/<repo>/", derived from GITHUB_REPOSITORY (so any account works, no hardcoding).
 * Note: a user/org site (a `<owner>.github.io` repo) or a custom domain must be
 * served from "/" — that case isn't auto-handled here and would need adjusting.
 * @returns {string} The base path, e.g. "/" locally or "/eslint-config/" on CI.
 */
function resolveBase() {
  if (!process.env.GITHUB_ACTIONS) {
    return '/';
  }

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

  return repo ? `/${repo}/` : '/';
}

export default defineConfig({
  base: resolveBase(),
  title: '@moc-global/eslint-config',
  description: 'The shared, company-wide ESLint flat config for Node.js, NestJS, React, and Vue — with a one-command installer.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/why' },
      { text: 'Reference', link: '/reference/plugins' },
      { text: 'Changelog', link: '/changelog' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Why this config', link: '/guide/why' },
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'How it works', link: '/guide/how-it-works' },
        ],
      },
      {
        text: 'Usage',
        items: [
          { text: 'Stacks & add-ons', link: '/guide/stacks' },
          { text: 'The installer CLI', link: '/guide/cli' },
          { text: 'Existing & legacy projects', link: '/guide/existing-projects' },
          { text: 'Versioning & upgrades', link: '/guide/versioning' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Rules & plugins', link: '/reference/plugins' },
          { text: 'API: moc() & factories', link: '/reference/api' },
        ],
      },
      {
        text: 'Project',
        items: [
          { text: 'Contributing', link: '/guide/contributing' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/dmytro-vakulenko-moc/eslint-config' }],

    footer: {
      message: 'Internal tooling — Master of Code Global',
      copyright: 'Maintained by Dmytro Vakulenko',
    },

    search: { provider: 'local' },
  },
});
