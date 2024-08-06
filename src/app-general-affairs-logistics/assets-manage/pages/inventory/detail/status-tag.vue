<template>
  <view v-show="label" :class="`device-status ${size ? size : ''} ${tagClass}`">{{ label }}</view>
</template>

<script setup lang="ts">
import { isNil } from 'lodash-es';
import { computed } from 'vue';
import { ApprovalStatus } from './types';

const props = defineProps<{
  size?: 'small';
  status?: number | string | null;
  label?: string | null;
}>();

const tagClass = computed(() => {
  if (isNil(props.status)) {
    return '';
  }
  switch (+props.status) {
    // case ApprovalStatus.IN_PROGRESS:
    // return 'text-white color-primary-bg';
    case ApprovalStatus.APPROVE:
      return 'text-white color-warning-bg';
    case ApprovalStatus.REJECT:
      return 'text-white color-error-bg';
    case ApprovalStatus.FINISH:
      return 'text-white color-success-bg';
    case ApprovalStatus.CANCEL:
      return 'text-default color-fill-bg';
    default:
      return 'text-white color-primary-bg';
  }
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.device-status {
  padding: 4rpx 16rpx;
  line-height: 40rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  &.small {
    padding: 4rpx 8rpx;
    font-size: 22rpx;
    line-height: 32rpx;
  }
}
</style>
