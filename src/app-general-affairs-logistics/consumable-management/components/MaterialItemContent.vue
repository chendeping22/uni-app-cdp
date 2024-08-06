<script setup lang="ts">
import { Material } from '../types/material';

const props = defineProps<{
  data: Material;
  schema: {
    title: string;
    key: string;
    showState?: boolean;
  }[];
}>();
</script>

<template>
  <view v-if="data && schema" class="material-item-content">
    <view v-for="item in schema" :key="item.key" class="material-item-param">
      <view class="material-item-label subheadline-regular">
        {{ item.title }}
      </view>
      <view
        class="material-item-value subheadline-regular"
        :class="item.showState && data?.isWarning ? 'txt-warning' : ''"
      >
        {{ data[item.key] || data[item.key] === 0 ? data[item.key] : '/' }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.material-item {
  &-content {
    border-top: 1px solid #0000000f;
    padding-top: 24rpx;
    padding-bottom: 8rpx;
  }
  &-param {
    display: flex;
    margin-bottom: 16rpx;
    overflow: hidden;
  }
  &-label {
    width: 172rpx;
    margin-right: 24rpx;
    color: $color-text-description;
  }
  &-value {
    flex: 1;
    color: $color-text-heading;
  }
}
.txt-warning {
  color: $color-error;
}
</style>
