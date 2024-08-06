<template>
  <view class="phone-tip">
    <view class="title1">手机号</view>
    <view class="phone1">{{ encryptPhone(userInfo?.tel) }}</view>
  </view>
</template>

<script setup lang="ts">
import { loginStore } from '@/store/modules/login';

const store = loginStore();
const { userInfo } = store;

// 手机号中间4位加密方法
const encryptPhone = (phone: string) => {
  if (!phone) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
</script>

<style scoped lang="scss">
.phone-tip {
  padding: px2rpx(12) px2rpx(16);
  background-color: rgba($color-text-base, 0.04);
  border-radius: px2rpx(8);
  margin-bottom: px2rpx(12);
  .title1 {
    @include body-regular;
    color: rgba($color-text-base, 0.65);
    margin-bottom: px2rpx(4);
  }
  .phone1 {
    @include subheadline-medium;
    color: rgba($color-text-base, 0.88);
  }
}
</style>
