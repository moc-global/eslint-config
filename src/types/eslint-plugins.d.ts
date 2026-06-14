// Ambient declarations for ESLint plugins that ship no type definitions.
// They are consumed only as opaque flat-config plugin objects; a minimal shape
// keeps `noImplicitAny` satisfied without unsafe `any` member access, while the
// spreadable `configs` value type allows `...plugin.configs[name]`.
declare module 'eslint-plugin-promise' {
  const plugin: { configs: Record<string, Record<string, unknown>> };

  export default plugin;
}

declare module 'eslint-plugin-security' {
  const plugin: { configs: Record<string, Record<string, unknown>> };

  export default plugin;
}
