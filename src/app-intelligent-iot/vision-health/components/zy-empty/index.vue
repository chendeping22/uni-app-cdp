<template>
  <view class="empty-main">
    <image
      class="empty-bg"
      :src="imageUrl ? imageUrl : '@/app-intelligent-iot/static/image/empty_bg_default.svg'"
      mode="widthFix"
    />
    <view class="empty-text">
      {{ description }}
    </view>
  </view>
</template>

<script setup>
import emptybg from '@/app-intelligent-iot/static/image/empty_bg_default.svg';
// props数据
defineProps({
  description: {
    type: String,
    default: '暂无数据',
  },
  imageUrl: {
    type: String,
    default: emptybg,
  },
});
</script>

<style lang="scss" scoped>
.empty-main {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-bg {
  width: 200rpx;
}

.empty-text {
  color: #969799;
  font-size: 28rpx;
  line-height: 40rpx;
  margin-top: 32rpx;
  padding: 0 120rpx;
}
</style>
