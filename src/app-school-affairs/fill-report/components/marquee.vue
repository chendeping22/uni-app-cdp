<template>
  <view
    id="marqueeWrapper"
    ref="marqueeWrapper"
    class="marquee-wrapper"
    :class="active ? 'marquee-active' : ''"
  >
    <view id="marqueeItem" ref="marqueeItem" class="marquee-item">
      <view class="marquee-text">{{ label }}</view>
    </view>
    <view v-if="active" class="marquee-item">
      <view class="marquee-text">{{ label }}</view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { uGetDom } from '../utils/common';

const instance = getCurrentInstance();

const props = defineProps<{
  label: string;
  disabled?: boolean;
}>();

const active = ref(false);
const marqueeWrapper = ref();
const marqueeItem = ref();
onMounted(async () => {
  if (props.disabled) {
    return;
  }
  // #ifdef APP-PLUS || MP-WEIXIN
  setTimeout(async () => {
    const wrapperDom = await uGetDom(instance, '#marqueeWrapper');
    const itemDom = await uGetDom(instance, '#marqueeItem');
    const marqueeWrapperWidth = wrapperDom.width || 0;
    const marqueeItemWidth = itemDom.width || 0;
    if (marqueeItemWidth && marqueeWrapperWidth) {
      active.value = marqueeItemWidth > marqueeWrapperWidth;
    } else {
      active.value = false;
    }
  }, 80);
  // #endif
  // #ifdef H5
  setTimeout(() => {
    if (marqueeWrapper.value && marqueeItem.value) {
      active.value = marqueeItem.value.$el.offsetWidth > marqueeWrapper.value.$el.offsetWidth;
    }
  }, 80);
  // #endif
});
</script>
<style lang="scss" scoped>
@keyframes my-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
.marquee-wrapper {
  padding: 24rpx 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  width: 100%;
  height: 96rpx;
}
.marquee-active {
  .marquee-item {
    animation: my-marquee 10s linear;
    animation-delay: 250ms;
    padding-right: 90%;
    font-weight: 400;
    font-size: 38rpx;
  }
}
.marquee-text {
  white-space: nowrap;
  text-wrap: nowrap;
  font-size: 38rpx;
  color: #000;
}
.marquee-item {
  white-space: nowrap;
  padding: 0 24rpx;
  height: 48rpx;
  line-height: 48rpx;
  font-weight: 400;
}
</style>
