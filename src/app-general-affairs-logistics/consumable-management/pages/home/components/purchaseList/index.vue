<script setup lang="ts">
import dayjs from 'dayjs';
import { statusList } from '../../constants';
const props = defineProps<{
  listData: Record<string, any>[];
  listType: number; // 1 申请  2 清单
}>();
const getStatusName = (status?: number) => {
  return statusList?.find(v => v?.value === status)?.label;
};
const handleStatusStyle = (type?: number | string) => {
  let res = '';
  switch (+(type ?? 0)) {
    case 1: // 已提交
      res = 'color-primary-base color-primary-light-bg';
      break;
    case 3: //已驳回
      res = 'color-error-base color-error-light-bg';
      break;
    case 4: //退回
      res = 'text-Label color-fill-bg';
      break;
    case 5: //已同意
      res = 'color-success-base color-success-light-bg';
      break;
    default:
      res = 'color-fill-default color-fill-bg';
      break;
  }
  return res;
};
const emit = defineEmits<{
  (e: 'detail', item: any): void;
}>();
</script>
<template>
  <view v-for="item in listData" :key="item.id" class="list-item" @click="emit('detail', item)">
    <view class="code">采购单号：{{ item.code }}</view>
    <view class="status">
      <view v-if="listType === 1" class="status-item" :class="handleStatusStyle(item.status)">
        {{ getStatusName(item.status) }}</view
      >
      <view
        class="status-item"
        :class="
          item.purchaseStatus === 0
            ? 'text-Label color-fill-bg'
            : 'color-success-base color-success-light-bg'
        "
        >{{ item.purchaseStatus === 0 ? '未采购' : '已采购' }}</view
      >
    </view>
    <view class="desc">{{ item.itemDesc }}</view>
    <view class="item-bottom"
      ><view class="item-bottom-left"
        >{{ item.applyUser }}申请{{
          item.arrivalNoticeTime
            ? `，期望 ${dayjs(item.arrivalNoticeTime).format('YYYY-MM-DD')}到货`
            : ''
        }}</view
      ><view>{{ dayjs(item.createTime).format('YYYY-MM-DD HH:mm') }}</view></view
    >
  </view>
</template>
<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.list-item {
  margin-bottom: 24rpx;
  display: flex;
  padding: 24rpx 32rpx;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 #0000000a;
  .code {
    margin-bottom: 8rpx;
    color: #000000e0;
    text-overflow: ellipsis;
    font-family: 'PingFang SC';
    font-size: 32rpx;
  }
  .status {
    margin-bottom: 8rpx;
    display: flex;
    &-item {
      margin-right: 8rpx;
      padding: 0 16rpx;
      height: 48rpx;
      line-height: 48rpx;
      text-align: center;
      border-radius: 8rpx;
      font-size: 26rpx;
    }
  }
  .desc {
    margin-bottom: 8rpx;
    color: #000000;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 36rpx;
  }
}
.item-bottom {
  width: 100%;
  display: flex;
  color: #00000073;
  font-family: 'PingFang SC';
  font-size: 24rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 32rpx;
  &-left {
    flex: 1;
    margin-right: 8rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
