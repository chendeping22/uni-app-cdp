<script setup lang="ts">
import editWithBorder from '@/app-class-evaluation/static/edit_with_border.svg';
import { computed } from 'vue';

const props = defineProps<{
  editable: boolean;
  selectIds: string[];
  existMultiScheme: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:editable', editable: boolean): void;
  (e: 'jump-edit', type: 'all' | 'select'): void;
}>();

const count = computed(() => props.selectIds?.length || 0);

const onEditAll = () => {
  if (props.existMultiScheme) {
    uni.showToast({
      title: '存在不同的评价方案，请用【点评多班】进行点班',
      icon: 'none',
    });
    return;
  }

  emit('jump-edit', 'all');
};

const onSubmit = () => {
  if (!props.selectIds?.length) {
    uni.showToast({
      title: '请选择班级',
      icon: 'none',
    });
    return;
  }

  emit('update:editable', false);

  emit('jump-edit', 'select');
};

const handleEditable = () => {
  emit('update:editable', !props.editable);
};
</script>

<template>
  <template v-if="editable">
    <view class="evaluation-operates">
      <view class="evaluation-operates-content">
        <u-button style="flex: 1" @click="handleEditable">取消</u-button>
        <u-button
          v-if="props.selectIds.length"
          style="flex: 2; margin-left: 24rpx"
          type="primary"
          @click="onSubmit"
          >确定(已选{{ count }}个)
        </u-button>
        <u-button v-else style="flex: 2; margin-left: 24rpx" type="primary" disabled
          >请选择班级
        </u-button>
      </view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
    <view class="evaluation-operates-placeholder" />
  </template>
  <template v-else>
    <view class="evaluation-toolbar">
      <view class="evaluation-toolbar-content">
        <view class="evaluation-toolbar-item">
          <u-icon name="edit-pen" color="#1677FF" size="40"></u-icon>
          <text class="body-medium evaluation-toolbar-text" @click="onEditAll">点评全部班级</text>
        </view>
        <view class="evaluation-toolbar-line" />
        <view class="evaluation-toolbar-item" @click="handleEditable">
          <u-image
            width="40rpx"
            height="40rpx"
            border-radius="8rpx"
            :show-loading="false"
            :src="editWithBorder"
          ></u-image>
          <text class="body-medium evaluation-toolbar-text">点评多班</text>
        </view>
      </view>
    </view>
    <view class="evaluation-toolbar-placeholder"></view>
  </template>
</template>

<style lang="scss" scoped>
.evaluation-toolbar {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 112rpx;
  bottom: calc(112rpx + constant(safe-area-inset-bottom));
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  z-index: 2;
  &-placeholder {
    padding-top: 128rpx;
  }
  &-content {
    margin: 0rpx 32rpx 24rpx;
    padding: 0 16rpx;
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    background-color: #fff;
    border-radius: $radius-ms;
    box-shadow: $shadow-light-down-lg;
  }
  &-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-text {
    margin-left: 16rpx;
    color: $color-primary;
  }
  &-line {
    margin: 0 16rpx;
    width: 1px;
    height: 64rpx;
    background-color: $color-split;
  }
}
.evaluation-operates {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 999;
  background-color: #fff;
  &-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 128rpx;
    padding: 0 32rpx;
    box-shadow: $shadow-light-down-lg;
  }
  &-placeholder {
    padding-top: calc(16rpx + constant(safe-area-inset-bottom));
    padding-top: calc(16rpx + env(safe-area-inset-bottom));
  }
}
</style>
