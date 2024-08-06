<template>
  <view
    :class="[
      'components-card',
      `card-bg-${bgType}`,
      `${className}`,
      {
        'card-shadow': hasShadow,
        'card-radius': hasRadius,
        'card-margin': hasMargin,
        'card-padding': hasPadding,
        'card-stretch': stretch,
      },
    ]"
    :style="{ height: height }"
    @click="handleClick"
  >
    <slot></slot>
  </view>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    hasMargin: {
      type: Boolean,
      default: true,
    },
    hasPadding: {
      type: Boolean,
      default: true,
    },
    hasShadow: {
      type: Boolean,
      default: true,
    },
    height: {
      type: [Number, String],
      default: 'auto',
    },
    bgType: {
      type: String as PropType<'inverse' | 'empty' | 'bg' | 'bg2'>,
      default: 'inverse',
    },
    hasRadius: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
    stretch: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props, emits) {
    const handleClick = () => {
      emits.emit('click');
    };
    return { handleClick };
  },
});
</script>

<style lang="scss" scoped>
.components-card {
  &.card-bg-inverse {
    background: $ui-color-white;
  }
  &.card-bg-empty {
    background: $ui-color-fill-light;
  }
  &.card-bg-bg {
    background: $ui-color-fill-default;
  }
  &.card-bg-bg2 {
    background: $ui-color-fill-light;
  }

  display: flex;
  flex-direction: column;

  &.card-shadow {
    box-shadow: 0px 0px 20rpx 0px $ui-card-shadow;
  }
  &.card-radius {
    border-radius: $ui-radius-default;
  }
  &.card-margin {
    margin: $ui-gap-default $ui-gap-large;
  }
  &.card-padding {
    padding: $ui-gap-large;
  }
  &.card-stretch {
    flex-grow: 1;
  }
}
</style>
