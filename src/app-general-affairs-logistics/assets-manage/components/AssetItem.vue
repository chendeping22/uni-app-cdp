<script setup lang="ts">
import StatusTag from '../components/detail/assets-info/status-tag.vue';
import { Asset } from '../types/asset';

const props = defineProps<{
  node: Asset;
  disabled?: boolean;
  selected?: boolean;
  inner?: boolean;
  hideAssetStatus?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', node: Asset): void;
  (e: 'more', node: Asset): void;
}>();

const onClick = () => {
  if (props.disabled) {
    return;
  }
  emit('click', props.node);
};
</script>

<template>
  <view
    :class="['asset-item', inner ? 'item-inner' : '']"
    :style="{ opacity: disabled ? 0.5 : 1 }"
    @click="onClick"
  >
    <slot name="left">
      <view
        class="asset-item-checkbox"
        :style="{
          backgroundColor: selected ? '#176bfb' : '#fff',
          borderColor: selected ? '#176bfb' : '#c8c9cc',
          opacity: disabled ? 0.5 : 1,
        }"
      >
        <u-icon name="checkbox-mark" color="#fff" size="20"></u-icon>
      </view>
    </slot>
    <view class="asset-item-title">
      <view v-if="node.assetInfoImgVOList?.[0]?.fileUrl" class="asset-item-icon">
        <image class="icon-img" :src="node.assetInfoImgVOList[0].fileUrl" mode="aspectFit" />
      </view>
      <view v-else class="asset-item-icon icon-default">
        <u-icon name="photo" color="#999" size="34"></u-icon>
      </view>
      <view class="asset-item-main">
        <view class="asset-item-name-tag">
          <text class="asset-item-name">{{ node.assetName }}</text>
          <StatusTag
            v-if="!props?.hideAssetStatus"
            size="small"
            :status="node.assetStatus"
            :label="node.assetStatusShow"
            style="flex: none"
          />
        </view>
        <text class="asset-item-desc">{{ node.assetNo }}</text>
      </view>
    </view>
    <view class="asset-item-right" @click.stop="emit('more', props.node)">
      <slot name="right">
        <u-icon name="arrow-right" color="#666" :style="{ opacity: !disabled ? 0.5 : 1 }"></u-icon>
      </slot>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.asset-item {
  display: flex;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 24rpx 0 24rpx 32rpx;
  background-color: #fff;
  box-shadow: 0px 1px 2px 0px #0000000a;
  border-radius: 16rpx;
  &.item-inner {
    border-radius: 0;
    margin: 0;
    padding: 24rpx 0;
    box-shadow: none;
    border-bottom: 1px solid #0000000f;
    .asset-item-right {
      padding-right: 0;
    }
  }
  &-title {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  &-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: 40rpx;
    overflow: hidden;
  }
  &-name-tag {
    display: flex;
    align-items: center;
  }
  &-name {
    // flex: 1;
    font-size: 32rpx;
    font-weight: 500;
    margin-right: 16rpx;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-desc {
    font-size: 28rpx;
    color: #999;
    line-height: 40rpx;
    overflow: hidden;
    margin-top: 8rpx;
    text-overflow: ellipsis;
  }
  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    border-radius: 8rpx;
    margin-right: 32rpx;
    overflow: hidden;
    &.icon-default {
      background-color: #f2f2f2;
    }
  }

  .icon-img {
    width: 100%;
    height: 100%;
  }
  &-right {
    padding: 0 32rpx;
  }

  &-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    margin-right: 32rpx;
    border: 1px solid #c8c9cc;
    border-radius: 50%;
  }
}
</style>
