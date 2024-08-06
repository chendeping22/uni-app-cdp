<template>
  <c-empty v-if="!data?.length" content="暂无数据" top="0" />
  <view v-else class="bar-container">
    <View class="legend-container">
      <view class="legend-item">
        <view class="icon processed"></view>
        <view>已处理</view>
      </view>
      <view class="legend-item">
        <view class="icon not-processed"></view>
        <view>未处理</view>
      </view>
    </View>
    <view class="list-wrapper">
      <view v-for="item in data" :key="item.spaceId" class="item-wrapper">
        <view class="rank-value">
          <view class="flex-grow">{{ item.name }}</view>
          <view>
            <text class="value-strong">{{ item.total }}</text>
          </view>
        </view>
        <view class="rank-bar">
          <view
            class="value-bar processed"
            :style="{
              width: `${((item.processed || 0) * 100) / denominator}%`,
            }"
          ></view>
          <view
            class="value-bar not-processed"
            :style="{
              width: `${((item.notProcessed || 0) * 100) / denominator}%`,
            }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { IAlarmDataItem } from '../../../services/ai-control';

interface ItemData extends IAlarmDataItem {
  name?: string;
  spaceId?: string;
}

defineProps({
  data: {
    type: Array as PropType<Array<ItemData>>,
    default() {
      return [];
    },
  },
  denominator: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
