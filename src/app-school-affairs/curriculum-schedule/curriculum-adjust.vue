<template>
  <view class="h100">
    <view v-if="receiveCount > 0" class="receive-count flex-center" @click="handleTabChange(1)">
      {{ receiveCount > 99 ? '99+' : receiveCount }}
    </view>
    <view class="bg-white border-bottom border-line-default bold">
      <u-tabs-swiper
        class="curriculum-tabs-wrapper"
        :current="current"
        :font-size="32"
        active-color="#176bfb"
        inactive-color="#4e5969"
        :list="[{ name: '我申请的' }, { name: '我收到的' }]"
        :is-scroll="false"
        @change="handleTabChange"
      />
    </view>
    <view :style="{ height: tabContentHeight + 'px' }">
      <curriculum-adjust-mine
        :style="{ display: current === 0 ? 'block' : 'none', height: '100%' }"
      />
      <curriculum-adjust-receive
        v-if="receiveInit"
        :style="{ display: current === 1 ? 'block' : 'none', height: '100%' }"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { getMyPendingCount } from '../services/curriculum-adjust';
import CurriculumAdjustMine from './curriculum-adjust-mine.vue';
import CurriculumAdjustReceive from './curriculum-adjust-receive.vue';

const current = ref<number>(0);
const receiveInit = ref(false);
const receiveCount = ref<number>(0);

function handleTabChange(index: number) {
  current.value = index;
  if (index > 0) {
    receiveInit.value = true;
  }
  uni.$emit('CLOSE_ADJUST_APPLY_SEARCH_MORE');
}

const tabContentHeight = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const saveBottom = systemInfo.safeAreaInsets.bottom || 0;
  return windowHeight - uni.upx2px(82 + 116) - saveBottom;
});

async function updateReceiveCount() {
  const res: any = await getMyPendingCount();
  receiveCount.value = res || 0;
}

onBeforeMount(() => {
  updateReceiveCount();
  uni.$on('UPDATE_RECEIVE_ADJUST_COUNT', updateReceiveCount);
});

onBeforeUnmount(() => {
  uni.$off('UPDATE_RECEIVE_ADJUST_COUNT', updateReceiveCount);
});
</script>

<style lang="scss">
.curriculum-tabs-wrapper {
  :deep(.u-scroll-bar) {
    bottom: 0 !important;
  }
  :deep(.u-tabs-item) {
    font-weight: 500 !important;
  }
}
</style>

<style lang="scss" scoped>
.receive-count {
  position: absolute;
  top: 24rpx;
  left: calc(75% + 72rpx);
  height: 32rpx;
  min-width: 32rpx;
  font-size: 24rpx;
  line-height: 24rpx;
  padding: 0 8rpx;
  background-color: #ff4d4f;
  border-radius: 16rpx;
  text-align: center;
  color: #ffffff;
}
</style>
