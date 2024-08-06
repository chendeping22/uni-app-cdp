<template>
  <view class="dot-main">
    <view
      v-for="(item, index) in list"
      :key="index"
      :class="['dot-item', currentIndex == index ? 'active' : '']"
    ></view>
  </view>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
export default defineComponent({
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    current: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const currentIndex = ref(0);
    watch(
      () => props.current,
      val => {
        currentIndex.value = val;
      },
    );
    return {
      currentIndex,
    };
  },
});
</script>
<style scoped lang="scss">
.dot-main {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dot-item {
  width: 16rpx;
  height: 10rpx;
  border-radius: 100rpx;
  background-color: #dddd;
  margin: 0 8upx;
  box-sizing: border-box;
}
.active {
  border-radius: 100rpx;
  width: 36rpx;
  background-color: $ui-color-primary;
}
</style>
