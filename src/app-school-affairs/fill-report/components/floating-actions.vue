<template>
  <view v-if="actions.length > 0" class="fill-action-wrapper">
    <view
      v-for="item in actions"
      :key="item.key"
      class="fill-action-item"
      @click="() => handleActionClick(item)"
    >
      <image class="fill-action-img" :src="item.image"></image>
      <view class="fill-action-text">{{ item.title }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface ActionItem {
  key: string;
  image: string;
  title: string;
}
const emit = defineEmits(['action-click']);
defineProps<{
  actions: ActionItem[];
}>();
function handleActionClick(action: ActionItem) {
  emit('action-click', action);
}
</script>
<style lang="scss" scoped>
.fill-action-wrapper {
  position: fixed;
  right: 30rpx;
  bottom: 64rpx;
  bottom: calc(constant(safe-area-inset-bottom) + 64rpx);
  bottom: calc(env(safe-area-inset-bottom) + 64rpx);
  height: 140rpx;
  padding: 0 16rpx;
  border-radius: 20rpx;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.16);
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9;
}
.fill-action-item {
  width: calc(20vw - 20rpx);
  display: flex;
  padding: 0 16rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14rpx;
}
.fill-action-img {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
.fill-action-text {
  color: $u-main-color;
  margin-top: 16rpx;
  font-size: 24rpx;
}
</style>
