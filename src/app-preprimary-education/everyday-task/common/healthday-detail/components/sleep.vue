<template>
  <view class="flex padR padB">
    <c-image class="lh-0 mr-b" :src="iconSleep" :width="48" :height="48" />
    <view class="bold font-xt"> 睡眠 </view>
  </view>
  <view class="pt-b">
    <view class="flex font-content color-secondary">
      睡眠时长 <view class="font-xxt color-base mr-s ml-s">{{ list?.sleepTime || 0 }} </view> 分钟
    </view>
  </view>
  <view class="flex boxBlue bg-primary-light-3 color-blue radius-default font-desc">
    打败同年级 <view class=""> {{ list?.winSleepRate || 0 }} </view>%
  </view>
  <view class="pt-b">
    <view class="flex font-content color-base">
      <view class="color-placeholder"> 深度睡眠时长 </view>
      <view class="mr-s ml-s">{{ list?.deepSleep || 0 }} </view> 分钟
    </view>
  </view>
  <view class="pt-b">
    <view class="flex font-content color-base">
      <view class="color-placeholder"> 浅度睡眠时长 </view>
      <view class="mr-s ml-s">{{ list?.shallowSleep || 0 }} </view> 分钟
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import iconSleep from '../../../../static/image/sleep_icon.png';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    const list = ref({});
    watchEffect(() => {
      list.value = props.data;
    });
    return {
      list,
      iconSleep,
    };
  },
});
</script>

<style scoped lang="scss">
.boxBlue {
  width: fit-content;
  padding: 10rpx;
}
</style>
