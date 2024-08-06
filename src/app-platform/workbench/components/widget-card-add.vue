<template>
  <widget-card-base :widget="widget" :is-loaded-data="true" :body-height="0" :arrow="false">
    <template #right-icon>
      <u-icon
        :name="isAdded ? 'checkmark' : 'plus'"
        size="30"
        margin-left="12"
        label-size="26"
        :color="isAdded ? '#00000040' : '#000000e0'"
        :custom-style="{
          padding: '20rpx',
          height: '54rpx',
        }"
        @click="isAdded ? '' : $emit('add', $event)"
      ></u-icon>
    </template>
    <view style="min-height: 80rpx">
      <u-image
        :src="widget.screenshot"
        :show-loading="false"
        :fade="false"
        class="u-m-b-24"
        mode="widthFix"
      ></u-image>
    </view>
  </widget-card-base>
</template>

<script lang="ts" setup>
import type { IWidget } from '@/store/modules/workbench';
import widgetCardBase from './widget-card-base.vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  isAdded: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  title: '',
  isAdded: false,
});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['add']);

/** 3. your code here! */
</script>

<style scoped lang="scss">
.container {
  padding: 32rpx 24rpx 0;

  .u-card {
    position: relative;
    overflow: hidden;
    font-size: 34rpx;
    background-color: #ffffff;
    box-sizing: border-box;
    &__head {
      &--left {
        color: $u-main-color;
        padding: 26rpx 32rpx;

        &__title {
          max-width: 400rpx;
        }
      }

      &--right {
        color: $u-tips-color;
        margin-left: 6rpx;
        padding-right: 32rpx;
      }
    }
  }
}
</style>
