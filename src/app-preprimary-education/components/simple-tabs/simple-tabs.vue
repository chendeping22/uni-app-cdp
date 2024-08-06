<template>
  <view :class="['components-simple-tabs', { 'tabs-sticky': sticky }]" :style="{ top: top }">
    <view :class="['tab-header', { 'tab-header-radius': hasRadius }]">
      <view v-for="(item, index) in tabs" :key="'tabs_' + item + index" @click="handleClick(index)">
        <text :class="{ selected: index === activeIndex }">{{ item }}</text>
      </view>
    </view>
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    tabs: {
      type: Array as PropType<string[]>,
      default: [] as string[],
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    hasRadius: {
      type: Boolean,
      default: true,
    },
    sticky: {
      type: Boolean,
      default: false,
    },
    /** sticky的top */
    top: {
      type: String,
      default: '0px',
    },
  },
  emits: ['onchangeTab'],

  setup(p, ctx) {
    const handleClick = (index: number) => {
      ctx.emit('onchangeTab', index);
    };

    return { handleClick };
  },
});
</script>
<style scoped lang="scss">
.components-simple-tabs {
  background-color: $ui-color-fill-default;
  &.tabs-sticky {
    position: sticky;
    z-index: 99999;
  }
  .tab-header {
    width: 100%;
    display: flex;
    align-items: center;
    height: 88rpx;
    background-color: $ui-color-white;

    &.tab-header-radius {
      border-bottom-left-radius: $ui-radius-default;
      border-bottom-right-radius: $ui-radius-default;
    }
    > view {
      flex-grow: 1;
      text-align: center;
      &:nth-child(n + 2) {
        border-left: 1rpx solid $ui-color-line-default;
      }
    }
    text {
      font-size: $ui-font-size-xt;
      color: $ui-color-secondary;
      font-weight: $ui-font-weight-bold;
      &.selected {
        color: $ui-color-font-base;
        position: relative;
        &::after {
          content: ' ';
          position: absolute;
          height: 0;
          left: -24rpx;
          right: -24rpx;
          bottom: -18rpx;
          border-bottom: 2px solid $ui-color-primary;
        }
      }
    }
  }
}
</style>
