<template>
  <view class="detail-card">
    <view v-for="item in data" class="detail-modal">
      <view class="detail-title">{{ item.title }}</view>
      <view class="detail-content">
        <view v-for="children in item.content" class="detail-content-item">
          <view class="detail-content-label">
            {{ children.label }}
          </view>
          <view class="detail-content-value">
            {{ children.value || '/' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

interface IData {
  title?: string;
  content: { label?: string; value?: string }[];
}

const props = defineProps({
  data: {
    type: Array as PropType<IData[]>,
    default: [],
  },
});
</script>

<style lang="scss" scoped>
.detail-card {
  border-radius: 16rpx;
  background: $color-background-base;
  box-shadow: $shadow-light-down-base;
  padding: 32rpx;
}
.detail-title {
  color: $color-text;
  font-size: 26rpx;
  font-weight: 500;
}
.detail-content {
  border-radius: 16rpx;
  background: #00000005;
  padding: 24rpx;
  margin-top: 16rpx;
  &-item {
    display: flex;
    justify-content: space-between;
    font-size: 30rpx;
    margin-bottom: 24rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-label {
    color: $color-text-description;
    word-break: keep-all;
    margin-right: 32rpx;
  }
  &-value {
    color: $color-text;
    word-break: break-all;
  }
}
.detail-modal {
  margin-bottom: 32rpx;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
