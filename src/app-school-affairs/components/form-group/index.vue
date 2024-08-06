<template>
  <view :class="['plr-l radius-default bg-white', className]">
    <slot />
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    className: { type: String, default: '' },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss"></style>
