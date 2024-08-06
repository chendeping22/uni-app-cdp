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
  margin-bottom: px2rpx(24);
  @include footnote-regular;
  color: rgba($color-text-base, 0.45);
}
</style>
