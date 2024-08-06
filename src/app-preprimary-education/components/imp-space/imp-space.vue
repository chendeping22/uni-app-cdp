<template>
  <view
    :class="[
      'components-imp-space',
      `column-gap-${gapSize}`,
      `row-gap-${rowGap}`,
      `space-${direction}`,
      className,
      {
        'space-center': center,
        'vertical-center': verticalCenter,
        'space-wrap': wrap && direction === 'horizontal',
      },
    ]"
  >
    <slot />
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
/**
 * 间距组件
 */
export default defineComponent({
  props: {
    /** column-gap间距尺寸 */
    gapSize: {
      type: String as PropType<'default' | 'small' | 'large' | 'xs' | 'xl'>,
      default: 'default',
    },
    /** row-gap间距尺寸, wrap为true时生效 */
    rowGap: {
      type: String as PropType<'default' | 'small' | 'large' | 'xs' | 'xl'>,
      default: 'default',
    },
    className: {
      type: String,
      default: '',
    },
    /** 方向 */
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    /** 居中 */
    center: {
      type: Boolean,
      default: false,
    },
    verticalCenter: {
      type: Boolean,
      default: true,
    },
    /** 横向换行 */
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
<style scoped lang="scss">
.components-imp-space {
  display: inline-flex;
  &.space-horizontal {
    flex-direction: row;
    &.vertical-center {
      align-items: center;
    }
  }
  &.space-vertical {
    flex-direction: column;
    &.vertical-center {
      align-items: center;
    }
  }

  &.space-wrap {
    flex-wrap: wrap;
    &.row-gap-xs {
      margin-bottom: -$ui-gap-xxs;
    }
    &.row-gap-small {
      margin-bottom: -$ui-gap-xs;
    }
    &.row-gap-default {
      margin-bottom: -$ui-gap-default;
    }
    &.row-gap-large {
      margin-bottom: -$ui-gap-large;
    }
    &.row-gap-xl {
      margin-bottom: -$ui-gap-xl;
    }
  }

  &.column-gap-xs {
    margin-right: -$ui-gap-xxs;
  }
  &.column-gap-small {
    margin-right: -$ui-gap-xs;
  }
  &.column-gap-default {
    margin-right: -$ui-gap-default;
  }
  &.column-gap-large {
    margin-right: -$ui-gap-large;
  }
  &.column-gap-xl {
    margin-right: -$ui-gap-xl;
  }

  &.space-center {
    justify-content: center;
    width: 100%;
  }
}
</style>
