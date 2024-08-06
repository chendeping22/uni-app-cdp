<template>
  <view :class="[className, 'flex']">
    <view
      class="relative bg-primary-light-2 icon-40 radius-default"
      style="border-bottom-right-radius: 0"
    >
      <view class="icon-40 absolute" style="left: -6rpx">
        <view class="flex-center radius-default bg-primary" style="border-bottom-right-radius: 0">
          <text class="color-white font-secondary bold">{{ formmatNumber(index) }}</text>
        </view>
      </view>
    </view>
    <text class="ml-s font-title bold color-base">{{ title }}</text>
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    className: { type: [String, Array], default: '' },
    title: { type: String, default: '' },
    index: { type: Number, default: 1 },
  },
  emits: [],
  setup() {
    const formmatNumber = (int: number) => {
      return int < 10 ? `0${int}` : int;
    };
    return { formmatNumber };
  },
});
</script>
