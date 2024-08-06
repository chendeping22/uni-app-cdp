<template>
  <view class="custom-head" :style="'height:' + navBarStyle.customBar + 'px;'">
    <view class="" :style="navigateStyle">
      {{ title }}
    </view>
  </view>
  <view class="head-height" :style="'height:' + navBarStyle.customBar + 'px;'" />
</template>

<script setup name="zy-custom-head" lang="ts">
import { computed } from 'vue';
import { useStore } from '@/store/old';

const store = useStore();
// props数据
const props = defineProps({
  title: {
    type: String,
    default: '暂无数据',
  },
});
const navBarStyle = computed(() => {
  return store.state.navBarStyle;
});
const navigateStyle = computed(() => {
  return `padding-top:${navBarStyle.value.customBar - navBarStyle.value.custom?.height || 10}px;`;
});
</script>

<style lang="scss" scoped>
.custom-head {
  position: fixed;
  z-index: 999;
  width: 100%;
  top: 0;
  left: 0;
  text-align: center;
  // font-size: $zy-font-size34;
  color: $zy-middle-color3;
}

.head-height {
  height: 160rpx;
}
</style>
