<template>
  <view class="components-simple-tabs-item" :style="{ width, height }">
    <slot></slot>
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    width: { type: String, default: '100%' },
    height: { type: String, default: 'auto' },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss"></style>
