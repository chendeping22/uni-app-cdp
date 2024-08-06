<template>
  <view :class="[className]">
    <view class="ptb-s color-placeholder bold">{{ title }} </view>
    <slot />
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    className: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss"></style>
