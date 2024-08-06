<template>
    <view class="flex h-32 bg-fill-default plr-xxs">
      <view :class="`h-16 gradient-${type}`" :style="{ width: `${percent}%` }"></view>
    </view>
  </template>
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  export default defineComponent({
    props: {
      type: { type: String as PropType<'error' | 'warnning' | 'blue'>, default: 'error' },
      percent: { type: Number, default: 0 },
    },
    emits: [],
    setup() {
      return {};
    },
  });
  </script>
  <style scoped lang="scss">
  .gradient-error {
    background-image: linear-gradient(270deg, $ui-color-error-light-2 0%, $ui-color-error 100%);
  }
  .gradient-warnning {
    background-image: linear-gradient(270deg, $ui-color-warnning-light-2 0%, $ui-color-warnning 100%);
  }
  .gradient-blue {
    background-image: linear-gradient(270deg, $ui-color-blue-light-2 0%, $ui-color-blue 100%);
  }
  </style>
  