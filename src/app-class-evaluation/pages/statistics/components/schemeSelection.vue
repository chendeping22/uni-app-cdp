<template>
  <u-popup
    v-model="show"
    mode="bottom"
    height="50%"
    safe-area-inset-bottom
    @close="handleClose"
    :border-radius="32"
  >
    <view class="scheme-popup">
      <view class="scheme-popup-header">
        <view class="scheme-popup-cancel" @click="handleClose">取消</view>
        <view class="scheme-popup-title">方案选择</view>
        <view class="scheme-popup-sure" @click="handleChange">确定</view>
      </view>
      <scroll-view scroll-y class="scheme-popup-scroll">
        <view class="scheme-list" v-if="list.length">
          <view class="scheme-item" v-for="item in list" :key="item.id" @click="current = item">
            <view class="scheme-item-left">
              <view class="scheme-item-left-top">{{ item.name }}</view>
              <view class="scheme-item-left-bottom">
                <view class="scheme-item-left-bottom-title">{{ item?.schoolYearName }}</view>
                <view class="scheme-item-left-bottom-tag tag-green" v-if="item.enabled === 0"
                  >启用</view
                >
                <view class="scheme-item-left-bottom-tag tag-red" v-else>禁用</view>
              </view>
            </view>
            <view style="width: 48rpx">
              <u-image
                v-show="current.id === item.id"
                width="48rpx"
                height="48rpx"
                :src="Checkmark"
              ></u-image>
            </view>
          </view>
        </view>
        <u-empty-custom v-else text="暂无数据" mode="data"></u-empty-custom>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import Checkmark from '@/app-class-evaluation/static/checkmark.svg';

import { computed, ref, watch } from 'vue';

const props = defineProps<{ open: boolean; modelValue: any; list: any[] }>();
const emits = defineEmits(['onClose', 'update:modelValue', 'onChange']);

const show = computed(() => props.open);

const current = ref();
watch(
  () => props.modelValue,
  newCurrent => {
    current.value = newCurrent;
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  newCurrent => {
    current.value = newCurrent;
  },
  { immediate: true },
);

const handleChange = () => {
  emits('update:modelValue', current.value);
  emits('onClose');
  emits('onChange', current.value);
};
const handleClose = () => {
  emits('onClose');
};
</script>

<style lang="scss" scoped>
.scheme-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  &-header {
    padding: 24rpx 32rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  &-title {
    text-align: center;
    color: $color-text;
    flex: 1;
  }
  &-sure {
    color: #1677ff;
  }
  &-cancel {
    color: #000000a6;
  }
  &-scroll {
    height: 100%;
    flex: 1;
    overflow: hidden;
    padding: 16rpx;
    background: #fff;
  }
}
.scheme-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  &-left {
    flex: 1;
    margin-right: 32rpx;
    &-top {
      color: #000000e0;
      font-family: 'PingFang SC';
      font-size: 32rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 48rpx;
    }
  }
}
.scheme-item-left-bottom {
  display: flex;
  &-title {
    margin-right: 8rpx;
    flex: 1;
    color: #00000073;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 48rpx;
  }
}
.scheme-item-left-bottom-tag {
  height: 48rpx;
  padding: 4rpx 16rpx;
  align-items: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
}
.tag-green {
  background: #f6ffed;
  color: #52c41a;
}
.tag-red {
  background: #fff1f0;
  color: #ff4d4f;
}
</style>
