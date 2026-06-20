## MODIFIED Requirements

### Requirement: Component documentation policy is intentional

React function components SHALL NOT be required to carry a JSDoc block, since that
is not the React convention; documentation requirements apply to non-component
modules. This exemption SHALL also cover Next.js Route Handlers and middleware —
exported functions in `route.ts` and `middleware.ts` (e.g. `GET`, `POST`,
`middleware`) follow the same documented-by-types, no-JSDoc convention and SHALL NOT
be required to carry a JSDoc block.

#### Scenario: A documented-by-types component is accepted

- **WHEN** a typed React function component is linted without a JSDoc comment
- **THEN** `jsdoc/require-jsdoc` does not report it

#### Scenario: A Next.js Route Handler is accepted without JSDoc

- **WHEN** an App Router `route.ts` exports a `GET` handler without a JSDoc comment
- **THEN** `jsdoc/require-jsdoc` does not report it

#### Scenario: Next.js middleware is accepted without JSDoc

- **WHEN** a `middleware.ts` exports a `middleware` function without a JSDoc comment
- **THEN** `jsdoc/require-jsdoc` does not report it
