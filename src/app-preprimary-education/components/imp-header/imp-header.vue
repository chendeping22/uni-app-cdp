<template>
  <view :class="['components-imp-header', { 'is-card-header': isCardHeader }]">
    <view :class="['title-bar']" @click="handleClickHeader">
      <image v-if="leftImg" :src="leftImg" class="header-left-image no-shrink" />
      <view
        :class="[
          'header-title',
          titleSize,
          { 'extra-right': extraRight, 'text-ellipse': titleEllipsis },
        ]"
      >
        <view :class="[{ 'text-ellipse': titleEllipsis }]">{{ title }}</view>
        <view class="header-extra no-shrink">
          <slot name="extra"></slot>
        </view>
      </view>
      <c-icon v-if="hasArrow" name="icon_arrow_right" size="48" color-type="placeholder" />
    </view>
    <slot name="summary"> </slot>
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    title: { type: String, default: '' },
    titleSize: {
      // 以style-flament的为准
      type: String as PropType<
        'font-b' | 'font-l' | 'font-xl' | 'font-xxl' | 'font-xxxl' | 'font-xxxxl'
      >,
      default: 'font-xl',
    },
    leftImg: { type: String, default: '' },
    hasArrow: { type: Boolean, default: false },
    isCardHeader: { type: Boolean, default: false },
    extraRight: { type: Boolean, default: false },
    titleEllipsis: { type: Boolean, default: false },
  },
  emits: ['onClickHeader'],
  setup(props, ctx) {
    const handleClickHeader = () => {
      ctx.emit('onClickHeader', props);
    };
    return { handleClickHeader };
  },
});
</script>
<style scoped lang="scss">
.components-imp-header {
  padding: $ui-gap-default 0;
  &.is-card-header {
    margin-top: -$ui-gap-large;
  }
  .title-bar {
    display: flex;
    align-items: center;

    .header-left-image {
      margin-right: $ui-gap-xs;
      width: 50rpx;
      height: 50rpx;
    }

    .header-title {
      flex-grow: 1;
      color: $ui-color-base;
      font-weight: $ui-font-weight-bold;
      display: inline-flex;
      align-items: center;
      word-break: break-all;
      &.extra-right {
        justify-content: space-between;
      }
      .header-extra {
        margin-left: $ui-gap-default;
      }
    }

    .header-arrow {
      height: 52rpx;
      width: 28rpx;
      height: 52rpx;
      opacity: 0.3;
    }
  }
}
</style>
