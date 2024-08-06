<template>
  <view class="container safe-area-inset-bottom">
    <u-icon name="setting" size="56" @click="goToSetServerUrl"></u-icon>
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const goToSetServerUrl = () => {
      uni.navigateTo({ url: '/app-platform/login/server' });
    };
    return { goToSetServerUrl };
  },
});
</script>
<style scoped lang="scss">
.container {
  position: fixed;
  right: 30rpx;
  bottom: 30rpx;
}
</style>
