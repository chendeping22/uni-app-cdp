<script setup lang="ts">
import { Student } from '../types/student-selector';
import CircleCheckbox from './circle-checkbox.vue';
import icon_avatar from '/static/avatar.png';
import icon_sex_female from '/static/icon_sex_female.svg';
import icon_sex_man from '/static/icon_sex_man.svg';

const props = defineProps<{
  data: Student;
  selected?: boolean;
  selectable?: boolean;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'selected', checked: boolean, data: Student): void;
  (e: 'click', data: Student): void;
}>();

const onSelected = () => {
  if (props.selectable) {
    emit('selected', !props.selected, props.data);
  } else {
    emit('click', props.data);
  }
};
</script>

<template>
  <view :class="['student-item', className || '']" @click="onSelected">
    <view v-if="selectable" class="student-item-checkbox">
      <circle-checkbox @click="onSelected" :selected="selected" />
    </view>
    <image
      class="student-item-avatar"
      :src="`${data.headImgUrl || icon_avatar}`"
      mode="aspectFill"
    />
    <view class="student-item-content">
      <view class="u-flex student-item-name-icon">
        <view class="student-item-name body-regular">{{ data.studentName }}</view>
        <view class="icon-sex-size" v-if="data.gender">
          <image class="icon-sex-size" :src="data.gender == 1 ? icon_sex_man : icon_sex_female" />
        </view>
      </view>
      <view class="student-item-desc footnote-regular">{{ data.clazzName }}</view>
    </view>
    <view v-if="data.classStudentCode" class="student-item-right footnote-regular">
      班内学号{{ data.classStudentCode }}号
    </view>
  </view>
</template>

<style lang="scss" scoped>
.student-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 24rpx 0;
  // border-radius: $radius-base;
  border-bottom: 1px solid $color-border-secondary;
  &.hide-line {
    border-bottom: none;
  }
  &-checkbox {
    margin-right: 32rpx;
  }
  &-avatar {
    margin-right: 24rpx;
    width: 80rpx;
    height: 80rpx;
  }
  &-content {
    flex: 1;
    overflow: hidden;
  }
  &-name-icon {
    overflow: hidden;
  }
  &-name,
  &-desc {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &-name {
    color: $color-text;
    padding-right: 16rpx;
  }
  &-desc {
    margin-top: 8rpx;
    color: $color-text-description;
  }
  &-right {
    margin-left: 16rpx;
    color: $color-text-description;
  }
  .icon-sex-size {
    width: 40rpx;
    height: 40rpx;
  }
}
</style>
