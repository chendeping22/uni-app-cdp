<template>
  <view v-show="label" :class="`device-status ${size ? size : ''} ${tagClass}`">{{ label }}</view>
</template>

<script setup lang="ts">
import { isNil } from 'lodash-es';
import { computed } from 'vue';

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
    case 0:
      // 闲置中
      return 'text-white color-success-bg';
    case 1:
    case 2:
    case 3:
      // 在用、借用、审批中
      return 'text-white color-primary-bg';
    case 4:
    case 8:
    case 9:
      // 维修中 保养中 待维修
      return 'text-white color-warning-bg';
    case 5:
    case 6:
    case 7:
      // 调拨中、已处置、已报废
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
