<template>
  <view class="components-imp-bottom" :style="{ 'z-index': zIndex }">
    <slot />
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    zIndex: {
      type: Number,
      default: 1,
    },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss">
.components-imp-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-top: $ui-gap-default;
  padding-bottom: calc(env(safe-area-inset-bottom) + $ui-gap-default);
  background: $ui-color-white;
}
</style>
