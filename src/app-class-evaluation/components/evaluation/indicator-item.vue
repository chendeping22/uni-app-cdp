<script setup lang="ts">
import { Indicator } from '../../types/evaluation';
import CircleCheckbox from '../circle-checkbox.vue';

const props = defineProps<{
  data: Indicator;
  selected?: boolean;
  active?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selected', checked: boolean, data: Indicator): void;
  (e: 'click', data: Indicator, checked: boolean): void;
}>();

const onSelected = () => {
  emit('selected', !props.selected, props.data);
};

const onClick = () => {
  emit('click', props.data, !props.selected);
};
</script>

<template>
  <view :class="['indicator-item', active ? 'active' : '']" @click="onClick">
    <circle-checkbox @click="onSelected" :selected="selected" />
    <view class="indicator-item-text footnote-regular">{{ data.indicatorName }}</view>
    <view :class="['indicator-item-score footnote-regular', data.score > 0 ? 'primary' : 'success']"
      >{{ data.score > 0 ? '+' : '' }}{{ data.score || '0' }}</view
    >
  </view>
</template>

<style lang="scss" scoped>
.indicator-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: $radius-base;
  border: 1px solid $color-border-secondary;
  margin-bottom: 16rpx;
  &.active {
    background-color: $primary-bg;
    border-color: $color-primary;
  }
  &-text {
    flex: 1;
    word-break: break-all;
    padding: 0 32rpx 0 16rpx;
  }
  &-score {
    &.success {
      color: $color-success;
    }
    &.primary {
      color: $color-primary;
    }
  }
}
</style>
