# docs-branding Specification

## Purpose
Give the README and the VitePress documentation site the MOC visual identity: the brand
logo (README banner, site nav, and home hero) and the MOC brand-red accent color in place
of the default theme accent — with accent values that satisfy WCAG AA contrast in both the
light and dark themes.
## Requirements
### Requirement: The README displays the MOC logo

The repository `README.md` SHALL display the MOC logo (`docs/public/logo.svg`)
as a centered banner above the main heading, so the project's GitHub landing page
carries the brand mark. A single logo asset SHALL be used (no theme-specific
variants), because the mark reads correctly on both GitHub light and dark backgrounds.

#### Scenario: Logo banner renders above the title

- **WHEN** `README.md` is viewed on GitHub
- **THEN** the MOC logo appears centered above the `# eslint-config-mocg` heading, with descriptive `alt` text

### Requirement: The documentation site displays the MOC logo

The VitePress site SHALL display the MOC logo in the navigation bar (beside the
site title) and as the home page hero image, both sourced from the
public asset served at `/logo.svg`.

#### Scenario: Logo appears in the nav bar

- **WHEN** any documentation page is rendered
- **THEN** the logo is shown in the top navigation bar next to the site title

#### Scenario: Logo appears in the home hero

- **WHEN** the documentation home page is rendered
- **THEN** the logo is shown as the hero image

### Requirement: The documentation site uses the MOC brand-red accent

The VitePress site SHALL use the MOC brand red as its accent color in place of the
default theme accent, applied through the theme's brand CSS variables (links/accent
text, hover, and solid button fills) and the home hero name color, in **both** the
light and dark themes.

#### Scenario: Accent is red in the light theme

- **WHEN** the site is viewed in the light theme
- **THEN** links, the active-state accents, solid buttons, and the hero name are rendered in the brand red rather than the default blue

#### Scenario: Accent is red in the dark theme

- **WHEN** the site is viewed in the dark theme
- **THEN** links, the active-state accents, and solid buttons are rendered in the brand red rather than the default blue

### Requirement: Brand-accent colors meet WCAG AA contrast in both themes

The accent colors SHALL meet WCAG 2.1 AA contrast against the theme background they
are used on: accent/link **text** SHALL be ≥4.5:1, and **button labels** (large/bold
UI text) SHALL be ≥3:1. Because a single red value cannot satisfy this for text on
both a light and a dark background, the link/accent **text** color SHALL be defined
per theme; the brand red MAY be reused for solid button fills (with a white label) in
both themes.

#### Scenario: Link text passes AA in the light theme

- **WHEN** the light-theme link/accent text color is measured against the light background
- **THEN** its contrast ratio is ≥4.5:1

#### Scenario: Link text passes AA in the dark theme

- **WHEN** the dark-theme link/accent text color is measured against the dark background
- **THEN** its contrast ratio is ≥4.5:1

#### Scenario: Button labels pass AA

- **WHEN** a white button label is measured against the brand-red button fill
- **THEN** its contrast ratio is ≥3:1

### Requirement: The branded documentation site still builds

The branding changes (custom theme, logo references, accent overrides) SHALL NOT
break the documentation build; `npm run docs:build` SHALL continue to succeed.

#### Scenario: Docs build succeeds with branding applied

- **WHEN** `npm run docs:build` is run after the branding changes
- **THEN** the build completes successfully

