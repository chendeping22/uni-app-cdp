<script setup lang="ts">
import { EnumStatusMap } from '@/app-platform/infos/util';

const txtMap = {
  [EnumStatusMap.review]: '审核中',
  [EnumStatusMap.verifying]: '校验中',
  [EnumStatusMap.verify_fail]: '校验失败',
  [EnumStatusMap.top]: '置顶',
  [EnumStatusMap.timer]: '定时',
  [EnumStatusMap.down]: '已下线',
};

defineProps<{
  mode: EnumStatusMap;
}>();
</script>

<template>
  <view :class="['tag u-flex u-row-center u-col-center', mode]">
    <u-icon
      v-if="[EnumStatusMap.verifying, EnumStatusMap.review].includes(mode)"
      name="clock"
      size="24"
    />
    <u-icon v-if="mode === EnumStatusMap.verify_fail" name="error-circle" size="24" />
    <text class="txt">
      {{ txtMap[mode] }}
    </text>
  </view>
</template>

<style lang="scss" scoped>
.tag {
  @include caption-2-regular;
  display: inline-flex;
  margin-right: px2rpx(4);
  padding: 0 px2rpx(4px);
  border-radius: $radius-sm;
  height: px2rpx(20px);
  line-height: 2;

  // 审核
  &.review {
    background-color: $error-bg;
    color: $error-base;
    .txt {
      margin-left: $space-size-s;
    }
  }

  // 置顶
  &.top {
    background-color: $primary-bg;
    color: $color-primary;
    border: px2rpx(1px) solid $color-primary;
  }

  //  定时
  &.timer {
    background-color: $primary-bg;
    color: $color-primary;
    border: none;
  }

  // 下线
  &.down {
    background-color: rgba($color-text-base, 0.04);
    color: rgba($color-text-base, 0.65);
    border: px2rpx(1px) solid rgba($color-text-base, 0.15);
  }

  // 校验中
  &.verifying {
    background-color: $gold-01;
    color: $gold-06;
    border: none;

    .txt {
      margin-left: $space-size-s;
    }
  }

  // 校验失败
  &.verify_fail {
    background-color: rgba($color-error, 0.9);
    color: $color-text-inverse;
    border: none;
    .txt {
      margin-left: $space-size-s;
    }
  }
}
</style>
