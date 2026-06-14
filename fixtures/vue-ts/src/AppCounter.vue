<script setup lang="ts">
// A minimal SFC under a conventional lowercase `src/` directory, used to verify
// the Vue stack lints without crashing and without flagging the lowercase
// directory (`unicorn/filename-case` must check the SFC filename only).
defineProps<{ label: string }>();
</script>

<template>
  <button type="button">{{ label }}</button>
</template>
