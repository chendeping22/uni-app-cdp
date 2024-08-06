<template>
  <view class="detail-collapse">
    <view class="detail-collapse-title">{{ title }}</view>
    <u-collapse class="detail-collapse-content">
      <u-collapse-item v-for="(item, index) in itemList" :key="index">
        <template #title>
          <view class="collapse-header">
            <view class="collapse-header-left">
              <view class="collapse-header-text">{{ item?.name }}</view>
              <view class="collapse-header-no">{{ item?.no }}</view>
            </view>
            <view v-if="itemTypeName" class="collapse-header-right"
              >{{ itemTypeName }}{{ item?.realNum }}</view
            >
            <!-- 采购申请和清单详情 -->
            <view v-else class="collapse-header-right">
              <view class="collapse-header-price">{{ item?.price || '/' }}元</view>
              <view class="collapse-header-right-no">{{ item?.realNum }}</view>
            </view>
          </view></template
        >
        <view v-for="m in item.list" :key="m.key" class="collapse-item">
          <view class="collapse-item-left">{{ m.name }}</view>
          <view class="collapse-item-right">{{ m.value || '/' }}</view>
        </view>
      </u-collapse-item>
    </u-collapse>
  </view>
</template>

<script setup lang="ts">
import { map } from 'lodash-es';
import { PropType, computed } from 'vue';
import { IDetailConfig } from './type';

const props = defineProps({
  title: {
    type: String,
    default: '明细',
  },
  detailData: {
    type: Array,
    default: [],
  },
  detailConfig: {
    type: Object as PropType<IDetailConfig>,
    default: () => {},
  },
  itemTypeName: {
    type: String,
    default: '',
  },
});

const itemList = computed(() => {
  return map(props?.detailData, (v: any) => {
    const num = v?.[props?.detailConfig?.realNumFileName];
    const list = map(props?.detailConfig?.columns, l => ({ ...l, value: v?.[l?.key] }));
    return {
      no: v?.no,
      name: v?.name,
      unit: v?.unit,
      realNum: `${num || 0}${v?.unit}`,
      price: `${(num * v?.price).toFixed(2)}`,
      list,
      open: false,
    };
  });
});
</script>

<style lang="scss" scoped>
.detail-collapse {
  margin: 24rpx 0;
  background-color: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  &-title {
    color: $color-text;
    font-size: 32rpx;
    font-weight: 500;
  }
  &-content {
    margin-top: 16rpx;
  }
}
.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  &-left {
    flex: 1;
    margin-right: 16rpx;
  }
  &-no {
    color: $color-text-description;
    font-size: 26rpx;
  }
  &-text {
    color: $color-text;
    margin-bottom: 8rpx;
    font-size: 32rpx;
  }
  &-right {
    color: #000000a6;
    font-size: 32rpx;
    &-no {
      color: #00000073;
      text-align: right;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
  &-price {
    color: #faad14;
    text-align: right;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
  }
}
.collapse-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  font-size: 30rpx;
  margin-bottom: 16rpx;
  &:last-child {
    margin-bottom: 0;
  }
  &-left {
    min-width: 180rpx;
    margin-right: 16rpx;
    word-break: break-all;
    color: #000000a6;
  }
  &-right {
    word-break: break-all;
    flex: 1;
    color: $color-text;
  }
}
</style>
