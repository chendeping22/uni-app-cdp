<script setup lang="ts">
import { mapList } from '@/app-platform/infos/util';
import { map } from '@/utils/lodash-es';

const props = defineProps<{
  modelValue: number;
}>();

const pubRouteSet = map(mapList[0], i => (i as any).url);

function handleClick() {
  const url = pubRouteSet[props.modelValue];
  if (url) {
    uni.navigateTo({
      url,
    });
  }
}
</script>

<template>
  <view class="btn u-flex u-row-center u-col-center" @click="handleClick">
    <u-icon name="plus" color="#ffffff" size="40" top="2" />
  </view>
</template>

<style lang="scss" scoped>
.btn {
  width: $icon-size-xl;
  height: $icon-size-xl;
  @include large-title-regular;
  border-radius: 50%;
  background: $color-primary;
  color: $color-text-inverse;
  position: fixed;
  right: px2rpx(20px);
  box-shadow: $shadow-light-down-lg;
  bottom: calc(px2rpx(72px) + env(safe-area-inset-bottom));
}
</style>
