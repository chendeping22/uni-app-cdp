<script setup lang="ts">
import { ClassItem, ListTypeEnum } from '../../types/evaluation';
import CircleCheckbox from '../circle-checkbox.vue';

const props = defineProps<{
  data: ClassItem;
  type: ListTypeEnum;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selected', checked: boolean, data: ClassItem): void;
  (e: 'edit', data: any): void;
}>();

const onClick = () => {
  if (props.disabled) {
    return;
  }
  if (props.selectable) {
    emit('selected', !props.selected, props.data);
    return;
  }

  emit('edit', {
    initialSchemeId: props.data.initialSchemeId,
    schemeId: props.data.schemeId,
    moreQuery: `&title=${props.data.className || ''}`,
    clazzIds: props.data.classId ? [props.data.classId] : [],
  });
};
</script>

<template>
  <view
    :class="['class-item', `type-${type}`]"
    :style="{ opacity: selectable && disabled ? 0.5 : 1 }"
    @click="onClick"
  >
    <view class="class-item-checkbox">
      <circle-checkbox v-if="selectable" @click="onClick" :selected="selected" />
      <view v-else></view>
      <view
        :class="[
          'class-item-icon',
          'subheadline-regular',
          data.commentState ? 'finished' : 'unfinished',
        ]"
        :style="{
          fontSize: data.classAbbreviation?.length > 4 ? '22rpx' : '26rpx',
        }"
        >{{ data.classAbbreviation }}</view
      >
    </view>
    <view class="class-item-content">
      <view v-if="type === ListTypeEnum.list" class="class-item-class body-regular">{{
        data.className
      }}</view>
      <view class="class-item-name footnote-regular">{{ data.userName || '/' }}</view>
    </view>
    <view class="class-item-score body-regular">{{
      data.score || data.score === 0 ? data.score : '/'
    }}</view>
  </view>
</template>

<style lang="scss" scoped>
.class-item {
  display: flex;
  &-checkbox {
    display: flex;
    align-items: center;
  }
  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80rpx;
    height: 80rpx;
    border-radius: $radius-base;
    text-align: center;
    padding: 0 4rpx;
    &.finished {
      background-color: $primary-bg-hover;
    }
    &.unfinished {
      background-color: #00000026;
    }
  }
  &-content {
    overflow: hidden;
  }
  &-class,
  &-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &-name {
    color: $color-text-description;
  }
  &.type-list {
    margin-left: 32rpx;
    padding: 24rpx 32rpx 24rpx 0;
    border-bottom: 1px solid $color-split;
    align-items: center;
    .class-item-icon {
      margin-right: 32rpx;
    }
    .class-item-score {
      width: 84rpx;
      text-align: right;
    }
    .class-item-content {
      flex: 1;
    }
  }
  &.type-card {
    flex-direction: column;
    padding: 16rpx;
    margin: 12rpx;
    height: 208rpx;
    border-radius: $radius-base;
    box-shadow: $shadow-light-down-base;
    background-color: #fff;
    .class-item-checkbox {
      flex-direction: row-reverse;
      align-items: flex-start;
      justify-content: space-between;
    }
    .class-item-icon {
      margin-bottom: 16rpx;
    }
    .class-item-name {
      min-height: 36rpx;
    }
  }
}
</style>
