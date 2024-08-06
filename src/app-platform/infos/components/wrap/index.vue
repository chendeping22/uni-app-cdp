<template>
  <view :class="['wrap u-flex', { block: block }]">
    <slot />
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ block?: boolean }>(), { block: true });
</script>

<style lang="scss" scoped>
.wrap {
  padding-right: $space-size-md;
  &.block {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
