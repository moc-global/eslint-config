import { mocg } from 'eslint-config-mocg';

// The Vue stack is auto-detected from `vue` in this project's dependencies.
// `vueTs: true` opts into type-aware linting of `<script lang="ts">` blocks
// (vue-eslint-parser chained with the TypeScript parser). The `@/*` path alias
// is read from tsconfig.json.
export default mocg({ vueTs: true });
