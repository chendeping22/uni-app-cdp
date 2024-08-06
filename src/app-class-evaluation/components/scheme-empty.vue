<script setup lang="ts">
import { computed } from 'vue';
import { useClassEvaluationStore } from '../store/class-evaluation';
const store = useClassEvaluationStore();

defineProps<{
  type?: string;
}>();
const text = computed(() => {
  if (store.data.moralTeacherNames?.length) {
    return store.data.moralTeacherNames.join('、');
  }
  return '';
});
</script>

<template>
  <view class="scheme-empty">
    <view class="u-flex scheme-empty-icon">
      <u-icon name="info-circle-fill" size="144" color="#FAAD14" />
    </view>
    <view class="title-3-medium text-center"
      >未发现适合评价方案，{{ type ? '' : '请更换日期再试一次。' }}</view
    >
    <view class="callout-regular text-center scheme-empty-desc" v-if="text"
      >联系[{{ text }}]老师协助解决。</view
    >
    <view class="scheme-empty-content">
      <view class="caption-1-medium scheme-empty-content-title">可能原因：</view>
      <view class="caption-1-regular scheme-empty-content-item">1、评价方案未正式启用； </view>
      <view class="caption-1-regular scheme-empty-content-item">
        2、评价方案已归档或不在当前学期内；
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.scheme-empty {
  margin: 24rpx 32rpx;
  padding: 48rpx 32rpx;
  background-color: #fff;
  border-radius: $radius-base;
  &-icon {
    justify-content: center;
    margin-bottom: 24rpx;
  }
  &-desc {
    margin-top: 16rpx;
    color: $color-text-description;
  }
  &-content {
    margin-top: 48rpx;
    padding: 24rpx;
    background-color: #00000005;
    border-radius: $radius-base;
  }
  &-content-title {
    margin-bottom: 16rpx;
    color: $color-text-label;
  }
  &-content-item {
    color: $color-text-label;
    line-height: 32rpx;
  }
}
</style>
