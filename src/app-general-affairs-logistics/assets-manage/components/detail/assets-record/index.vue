<template>
  <view v-for="item in props?.recordData" :key="item.id" class="assets-record">
    <view class="record-header u-flex u-row-between">
      <view class="u-flex record-content">
        <u-avatar size="48" :src="item?.headImgUrl || icon_avatar"></u-avatar>
        <view class="record-title">{{ item?.createByName }}</view>
        <view class="record-time">{{ changeDateFormat(item?.createTime) }}</view>
      </view>
      <view :class="updateStatus(item?.bizType || '')" class="record-status">{{
        item?.bizTypeName
      }}</view>
    </view>
    <template v-if="item?.bizInfo && item?.bizInfo?.length">
      <RecordItem v-for="info in item?.bizInfo" :key="info.label" :info="info" />
    </template>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { find, keys } from 'lodash-es';
import { PropType, ref } from 'vue';
import { IRecordItem } from '../constants';
import RecordItem from './record-item.vue';
import icon_avatar from '/static/avatar.png';

const props = defineProps({
  recordData: {
    type: Array as PropType<IRecordItem[]>,
    default: [],
  },
});

/**
 * 入库、借用归还、变更、
 * 借用、领用、领用退还、
 * 报修、维修、保养、
 * 报废
 */
const assetsNode = ref<any>({
  unused: ['putApply', 'assetBorrowReturn', 'save', 'purchaseApply'], // 入库、借用归还、变更
  used: ['assetBorrow', 'assetAcceptance', 'assetAcceptReturn', 'update', 'assetChange'], // 借用、领用、领用退还
  repair: ['assetRepairApply', 'repairTask', 'maintenance'], // 报修、维修、保养
  useless: ['acbf', 'assetDisposal', '处置'], // 报废
});

const assetsNodeStyle = ref<any>({
  unused: 'color-success-base color-success-light-bg',
  used: 'color-primary-base color-primary-light-bg',
  repair: 'color-warning-base color-warning-light-bg',
  useless: 'text-default-color color-fill-bg',
});

const updateStatus = (val: any) => {
  const statusKeys = keys(assetsNode.value);
  const statusData: any = find(statusKeys, v => assetsNode.value[v].includes(val)) || 'useless';
  return assetsNodeStyle.value[statusData];
};

const changeDateFormat = (date?: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '');
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.assets-record {
  margin-bottom: 32rpx;
  padding-top: 32rpx;
}

.border-top {
  border-top: 1px solid $borderColor;
}
.record-status {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  word-break: keep-all;
}
.record-time {
  color: #999;
  // word-break: keep-all;
  margin-right: 16rpx;
}
.record-title {
  margin: 0 16rpx;
}
.record-content {
  display: flex;
  font-size: 26rpx;
  align-items: center;
  // flex-wrap: wrap;
}
</style>
