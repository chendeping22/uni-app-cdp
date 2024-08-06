<template>
  <view
    :class="[
      'components-imp-empty-data',
      `empty-${size}`,
      className,
      { horizontal: direction === 'horizontal' },
    ]"
  >
    <image class="empty-image" :src="icon_innumerable" />
    <view
      v-if="title"
      :class="['extra-info', { 'empty-horizontal-title': direction === 'horizontal' }]"
    >
      <text>{{ title }}</text>
    </view>
  </view>
</template>
<script lang="ts">
import icon_innumerable from '@/app-preprimary-education/static/svg/icon_innumerable.svg';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    title: { type: String, default: '' },
    className: { type: String, default: '' },
    size: { type: String as PropType<'default' | 'small'>, default: 'default' },
    direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
  },
  emits: [],
  setup() {
    return { icon_innumerable };
  },
});
</script>
<style scoped lang="scss">
.components-imp-empty-data {
  padding: $ui-gap-large 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;

  &.empty-default {
    .empty-image {
      width: 140rpx;
      height: 104rpx;
    }
    .extra-info {
      font-size: $ui-font-size-xt;
    }
  }
  &.empty-small {
    .empty-image {
      width: 76rpx;
      height: 52rpx;
    }
    .extra-info {
      font-size: $ui-font-size-title;
    }
  }
  &.horizontal {
    justify-content: center;
    flex-direction: row;
  }
  .extra-info {
    color: $ui-color-placeholder;
    font-weight: $ui-font-weight-bold;
    margin-top: $ui-gap-large;
  }
  .empty-horizontal-title {
    margin-top: unset;
    margin-left: $ui-gap-large;
  }
}
</style>
