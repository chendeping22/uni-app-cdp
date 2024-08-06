<script setup lang="ts">
import icon_garage from '@/app-general-affairs-logistics/static/garage.svg';
import dayjs from 'dayjs';
import { computed } from 'vue';
import { RecordTypeEnum } from '../../constants';

const props = defineProps<{
  listData: Record<string, any>[];
  currentTab?: number;
}>();

const emit = defineEmits<{
  (e: 'detail', item: any): void;
}>();

const cardParams = {
  [RecordTypeEnum.ConsumableInventoryRecord]: { codeLabel: '入库单号', showStore: true },
  [RecordTypeEnum.ConsumablesOutboundRecord]: { codeLabel: '出库单号' },
  [RecordTypeEnum.ConsumablesLossOutboundRecord]: { codeLabel: '出库单号' },
  [RecordTypeEnum.ConsumablesReturnRecord]: { codeLabel: '退库单号' },
};

const codeLabel = computed(
  () => cardParams[props.currentTab || RecordTypeEnum.ConsumableInventoryRecord]?.codeLabel,
);

const showStore = computed(
  () => cardParams[props.currentTab || RecordTypeEnum.ConsumableInventoryRecord]?.showStore,
);

const timeFormat = (time?: number) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '';
};
</script>
<template>
  <view v-for="item in listData" :key="item.id" class="list-item" @click="emit('detail', item)">
    <view class="list-item-code">{{ codeLabel }}：{{ item.code }}</view>
    <view v-if="showStore" class="list-item-store"
      ><u-image :src="icon_garage" :width="32" :height="32"></u-image
      ><text class="list-item-store-txt">{{ item.storeName }}</text></view
    >
    <view class="list-item-desc">{{ item.itemDesc }}</view>
    <view class="list-item-info"
      ><view class="list-item-user"
        >{{ item.applyUser }}{{ item?.departmentName ? `[${item?.departmentName}]` : '' }}</view
      ><view class="list-item-time">{{ timeFormat(item.applyTime || item.createTime) }}</view></view
    >
  </view>
</template>
<style lang="scss" scoped>
.list-item {
  margin-bottom: 24rpx;
  display: flex;
  padding: 24rpx 32rpx;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  background: $color-background-base;
  border-radius: 16rpx;
  box-shadow: $shadow-light-down-base;
  width: 100%;
  &-code {
    color: $color-text;
    font-weight: 500;
    margin-bottom: 16rpx;
  }
  &-store {
    color: #000000a6;
    font-size: 26rpx;
    background: $color-bg-container-disabled;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    &-txt {
      margin-left: 16rpx;
      flex: 1;
    }
  }
  &-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 16rpx;
    width: 100%;
    color: $color-text-description;
    font-size: 24rpx;
  }
  &-desc {
    color: $color-text-base;
  }
  &-user {
    flex: 1;
    @include ellipsis;
  }
  &-time {
    margin-left: 16rpx;
  }
}
</style>
