<template>
  <view v-if="needProcessCount" class="radius-default bg-white pt-b" @click="handleEntryApply">
    <view class="flex plr-b ptb-s bg-warnning-light-3">
      <u-icon name="volume" size="40" color="#fe7c00" />
      <text class="color-warnning flex-grow mlr-xs">{{ needProcessCount }}条入班申请</text>
      <u-icon name="arrow-right" color="#fe7c00" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import { needToProcessCount } from '@/services/contact';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';

const emits = defineEmits(['onApplyTipShow']);

const needProcessCount = ref(0);
const fetchNeedToProcessCount = async () => {
  const res = await needToProcessCount();
  needProcessCount.value = res;
  const applyTipShow = res > 0;
  console.log('onApplyTipShow : ' + applyTipShow);
  emits('onApplyTipShow', applyTipShow);
};

const handleEntryApply = () => {
  uni.navigateTo({
    url: `/app-platform/contacts/entry-application/index`,
  });
};

onBeforeMount(() => {
  fetchNeedToProcessCount();
  uni.$on('ApplyTipOnShow', fetchNeedToProcessCount);
});
onBeforeUnmount(() => {
  uni.$off('ApplyTipOnShow', fetchNeedToProcessCount);
});
</script>
<style scoped lang="scss">
.radius-default {
  border-radius: 12rpx;
}
.bg-white {
  background: #ffffff;
}
.pt-b {
  padding-top: 12rpx;
}
.flex {
  display: flex;
  align-items: center;
}
.flex-grow {
  /** 填满剩余空间 */
  flex-grow: 1;
}
.plr-b {
  padding-left: 24rpx;
  padding-right: 24rpx;
}
.ptb-s {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}
.mlr-xs {
  margin-left: 12rpx;
  margin-right: 12rpx;
}
.color-warnning {
  color: #fe7c00;
}
.bg-warnning-light-3 {
  background: #fff7e8;
}
</style>
