<template>
  <view
    :class="[
      'components-imp-empty-line',
      `empty-line-${size}`,
      { 'empty-bottom': isBottom },
      className,
    ]"
  >
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    className: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<'large' | 'normal' | 'small' | 'xl' | 'safe-bottom' | 'noticebar'>,
      default: 'normal',
    },
    /** 用于填充imp-bottom组件 */
    isBottom: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss">
.components-imp-empty-line {
  width: 100%;
  &.empty-bottom {
    padding-bottom: calc(env(safe-area-inset-bottom) + $ui-gap-xl);
  }

  &.empty-line {
    /** large的尺寸暂无场景, 随便写的, 可即时修改 */
    &-xl {
      height: 96rpx;
    }
    &-large {
      height: 64rpx;
    }
    &-normal {
      height: 32rpx;
    }
    &-small {
      height: 24rpx;
    }
    &-safe-bottom {
      height: env(safe-area-inset-bottom);
    }
    &-noticebar {
      height: 120rpx;
    }
  }
}
</style>
