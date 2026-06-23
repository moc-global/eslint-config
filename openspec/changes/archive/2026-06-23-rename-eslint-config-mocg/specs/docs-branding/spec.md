## MODIFIED Requirements
### Requirement: The README displays the MOC logo

The repository `README.md` SHALL display the MOC logo (`docs/public/logo.svg`)
as a centered banner above the main heading, so the project's GitHub landing page
carries the brand mark. A single logo asset SHALL be used (no theme-specific
variants), because the mark reads correctly on both GitHub light and dark backgrounds.

#### Scenario: Logo banner renders above the title

- **WHEN** `README.md` is viewed on GitHub
- **THEN** the MOC logo appears centered above the `# eslint-config-mocg` heading, with descriptive `alt` text
