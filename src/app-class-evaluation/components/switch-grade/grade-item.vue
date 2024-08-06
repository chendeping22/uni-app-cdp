<script setup lang="ts">
import CircleCheckbox from '../circle-checkbox.vue';
import { GradeTypeEnum, IGradeItem } from './utils';

const props = defineProps<{
  data: IGradeItem;
  isMore?: boolean;
  isMoreClose?: boolean;
  selected?: boolean;
  multiple: boolean;
  isClass?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selected', checked: boolean, data: IGradeItem): void;
  (e: 'more', data: IGradeItem): void;
}>();

const onSelected = () => {
  if (props.isClass && props.data.type !== GradeTypeEnum.Class) {
    emit('more', props.data);
    return;
  }
  emit('selected', props.multiple ? !props.selected : true, props.data);
};

const onMore = () => {
  emit('more', props.data);
};
</script>

<template>
  <view class="grade-item" @click="onSelected">
    <circle-checkbox
      class="grade-item-checkbox"
      v-if="multiple"
      @click="onSelected"
      :selected="selected"
    />
    <view class="grade-item-text body-regular">{{ data.name }}</view>
    <view class="grade-item-right" v-if="!multiple && selected">
      <u-icon name="checkmark" color="#1677FF" size="36" />
    </view>
    <view class="grade-item-right" @click.stop="onMore" v-if="isMore">
      <u-icon v-if="isMoreClose" name="arrow-down" color="#00000073" size="34"></u-icon>
      <u-icon v-else name="arrow-up" color="#00000073" size="34"></u-icon>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.grade-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx 24rpx 0;
  color: $color-text-heading;
  border-bottom: 1px solid $color-border-secondary;
  &-text {
    flex: 1;
    word-break: break-all;
  }
  &-checkbox {
    margin-right: 32rpx;
  }
  &-score {
    &.success {
      color: $color-success;
    }
    &.primary {
      color: $color-primary;
    }
  }
  &-right {
    margin-left: 32rpx;
    position: relative;
    &::after {
      content: ' ';
      position: absolute;
      width: 200%;
      height: 200%;
      left: -50%;
      top: -50%;
    }
  }
}
</style>
