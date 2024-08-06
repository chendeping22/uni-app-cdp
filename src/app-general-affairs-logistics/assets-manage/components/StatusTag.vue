<template>
  <view v-if="!isNil(status)" :class="`tag-status ${handleStatusStyle(status)}`">
    {{ getStatusName(status) }}</view
  >
</template>

<script setup lang="ts">
import {
  RecordTypeEnum,
  disposeStatusList,
  serviceStatusList,
  statusList,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { handleStatusStyle } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { isNil } from 'lodash-es';

const props = defineProps({
  status: {
    type: Number,
    default: '',
  },
  type: {
    type: Number,
    default: '',
  },
});

const getStatusName = (status?: number | string) => {
  let list: any[] = [];
  switch (props?.type) {
    case RecordTypeEnum.ServiceRecord:
      list = serviceStatusList;
      break;
    case RecordTypeEnum.DisposeRecord:
      list = disposeStatusList;
      break;
    default:
      list = statusList;
      break;
  }
  return list.find(v => v?.value === status)?.label || '已完成';
};
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.tag-status {
  line-height: 48rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
}
</style>
