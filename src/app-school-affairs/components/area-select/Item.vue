<script setup lang="ts">
import { Area } from './types';

const props = defineProps<{
  node: Area;
  selected?: boolean;
  showFullName?: boolean;
  isShowDill?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', node: Area): void;
}>();

const onClick = () => {
  emit('click', props.node);
};
</script>

<template>
  <u-cell-item :arrow="isShowDill" @click="onClick">
    <template #title>
      <view class="item-title">
        <text class="item-name body-regular">
          {{ showFullName ? node.namePath.join(' / ') : node.areaName }}
        </text>
      </view>
    </template>
  </u-cell-item>
</template>

<style lang="scss" scoped>
.item-title {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.88);
}

.item-name {
  flex: 1;
}

.item-desc {
  color: #999;
}

.item-icon,
.item-avatar {
  width: 64rpx;
  height: 64rpx;
  margin-left: -8rpx;
  margin-right: 16rpx;
  border-radius: 50%;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  border: 1px solid #eee;
}

.icon-img {
  width: 40rpx;
  height: 40rpx;
  opacity: 0.6;
}

.item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 36rpx;
  border: 1px solid #c8c9cc;
  border-radius: 50%;
}

.arrow-drill {
  position: relative;
  &::after {
    content: ' ';
    display: inline-block;
    position: absolute;
    width: 48px;
    height: 48px;
    margin-top: -24px;
    margin-left: -24px;
    top: 50%;
    left: 50%;
  }
}
</style>
