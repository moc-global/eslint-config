## MODIFIED Requirements
### Requirement: Repository metadata points at the canonical repository

Repository metadata and links SHALL point at the canonical repository — the
package `repository`/`homepage`/`bugs`, changelog footer links,
README/SECURITY/issue-template links, and the docs social link. The published
package **name** is independent of the repository location and is not changed by this.

#### Scenario: Metadata reflects the canonical repo

- **WHEN** repository URLs are inspected
- **THEN** they reference `dmytro-vakulenko-moc/eslint-config`, while the package name remains `eslint-config-mocg`
