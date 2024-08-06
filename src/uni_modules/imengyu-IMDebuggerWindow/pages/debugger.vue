<template>
  <view class="debugger-background">
    <debuggerBox :is-from-window="true" @close="close" />
  </view>
</template>

<script>
import debuggerBox from './components/debuggerBox.vue';
export default {
  components: {
    debuggerBox,
  },
  methods: {
    close() {
      uni.navigateBack();
    },
  },
  onHide() {
    uni.$emit('debugger-view-closed');
  },
  onShow() {
    uni.$emit('debugger-view-opened');
  },
};
</script>

<style lang="scss">
.debugger-background {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
