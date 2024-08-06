<template>
  <view class="desc-tip">
    {{ title }}
  </view>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style scoped lang="scss">
.desc-tip {
  margin-bottom: px2rpx(12);
  @include subheadline-medium;
  color: rgba($color-text-base, 0.88);
}
</style>
