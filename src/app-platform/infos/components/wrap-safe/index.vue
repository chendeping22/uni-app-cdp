<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  /** 默认以375稿子换算的，内部*2 */
  height?: number;
}>();

const style = computed(() => {
  const height = props.height ? uni?.upx2px(props.height * 2) + 'px' : 'auto';
  return `height: ${height}`;
});
</script>

<template>
  <view :class="['safe-area-inset-bottom fixed-button', { relative: height }]">
    <view class="u-m-l-32 u-m-r-32 u-p-t-24 u-p-b-24" :style="style">
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.fixed-button {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: $color-background-base;
  box-shadow: $shadow-light-up-md;
  z-index: 2;

  &.relative {
    position: static;
    background: transparent;
    box-shadow: none;
  }
}
</style>
