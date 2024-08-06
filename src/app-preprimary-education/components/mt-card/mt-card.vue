<template>
  <c-card
    :padding-direct="('none' as any)"
    :class-name="[padding, className]"
    @click="$emit('click', $event)"
  >
    <slot />
  </c-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    padding: { type: [String, Array], default: 'plr-l ptb-b' },
    className: { type: [String, Array], default: '' },
  },
  emits: ['click'],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss"></style>
