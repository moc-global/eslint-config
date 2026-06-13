import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@moc-global/eslint-config',
  description: 'The shared, company-wide ESLint flat config for Node.js, NestJS, React, and Vue — with a one-command installer.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/why' },
      { text: 'Reference', link: '/reference/plugins' },
      { text: 'Changelog', link: '/guide/versioning' },
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
        items: [{ text: 'Contributing', link: '/guide/contributing' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/moc-global/eslint-config' }],

    footer: {
      message: 'Internal tooling — Master of Code Global',
      copyright: 'Maintained by Dmytro Vakulenko',
    },

    search: { provider: 'local' },
  },
});
