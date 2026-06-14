# rule-policy-coherence Specification

## Purpose
Keep the shared rule set coherent and free of false friction: it accepts idiomatic, type-safe code, never enables mutually contradictory rules, reports each concern through a single owning rule, applies an intentional component-documentation policy, and disables low-value rules whose reports are dominated by false positives.

## Requirements
### Requirement: The rule set accepts idiomatic, type-safe code

The shared configuration SHALL NOT reject widely-used, type-safe conventions that
ordinary framework code relies on. Specifically, the configuration SHALL allow
the React `*Props` naming convention and SHALL allow common full English words
such as `info` as method/property names.

#### Scenario: React props type name is accepted

- **WHEN** a component declares its props type as `ButtonProps`
- **THEN** `unicorn/prevent-abbreviations` does not require renaming it to `ButtonProperties`

#### Scenario: A logger method named `info` is accepted

- **WHEN** an object or class exposes an `info` method (e.g. a logger)
- **THEN** `@typescript-eslint/naming-convention` does not reject the name `info`

### Requirement: Rules do not contradict each other

The configuration SHALL NOT enable two rules that demand mutually exclusive code.
In particular, the floating-promise guard and the `void`-operator ban SHALL be
reconciled so the canonical fire-and-forget statement is legal.

#### Scenario: `void promise` statement satisfies both rules

- **WHEN** code marks an intentionally unawaited promise with `void somePromise()` as a statement
- **THEN** `@typescript-eslint/no-floating-promises` is satisfied and `no-void` does not report it

### Requirement: A single concern is reported by a single rule

Where two enabled plugins detect the same concern, the configuration SHALL enable
exactly one of them so a single issue is not reported twice.

#### Scenario: Super-linear regex reported once

- **WHEN** a regex with super-linear backtracking is linted
- **THEN** it is reported by `regexp/no-super-linear-backtracking` only, and `sonarjs/slow-regex` is disabled

#### Scenario: Deprecated symbol reported once

- **WHEN** deprecated API usage is linted
- **THEN** it is reported by `@typescript-eslint/no-deprecated` only, and `sonarjs/deprecation` is disabled

### Requirement: Component documentation policy is intentional

React function components SHALL NOT be required to carry a JSDoc block, since that
is not the React convention; documentation requirements apply to non-component
modules.

#### Scenario: A documented-by-types component is accepted

- **WHEN** a typed React function component is linted without a JSDoc comment
- **THEN** `jsdoc/require-jsdoc` does not report it

### Requirement: Low-value, false-positive-prone rules do not block clean code

The configuration SHALL NOT surface rules whose reports are dominated by false
positives on type-safe code. `security/detect-object-injection` SHALL be disabled,
and `max-classes-per-file` SHALL allow small co-located class groups.

#### Scenario: Typed-key record access is not flagged

- **WHEN** code indexes a `Record<Union, T>` with a value of that union type
- **THEN** `security/detect-object-injection` does not report it

#### Scenario: A small co-located error hierarchy is allowed

- **WHEN** a file defines a base error class plus two subclasses
- **THEN** `max-classes-per-file` does not report the file
