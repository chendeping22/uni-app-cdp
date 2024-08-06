<template>
  <view class="home-page">
    <view class="home-main">
      <view class="home-flex">
        <view
          class="home-flex--item"
          @click="toPage('/app-intelligent-iot/vision-collect/pages/check/index')"
        >
          <image
            style="width: 64rpx; height: 64rpx"
            src="../../assets/image/icon_check_work.png"
            mode=""
          />
          <view class="zy-margin-top-xs"> 检测工作 </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-collect/api';
import { loginStore } from '@/store/modules/login';
import { onLoad } from '@dcloudio/uni-app';

const userInfo = loginStore().userInfo;
// 页面路径跳转
const toPage = url => {
  uni.navigateTo({
    url: url,
  });
};
const login = tel => {
  let data = {
    mobile: tel,
  };
  $http.kangRui
    .loginEvent(data)
    .then(res2 => {
      console.log('loginEvent==========', res2);
    })
    .catch(err => {
      uni.showToast({
        title: err.desc,
        icon: 'none',
      });
      setTimeout(() => {
        uni.navigateBack({});
      }, 1500);
    });
};
onLoad(() => {
  login(userInfo.tel);
});
</script>

<style lang="scss" scoped>
.home-bg {
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
}

.home-page {
  padding: 30rpx;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

.home-main {
  position: relative;
  z-index: 1;
}

.zy-head {
  text-align: center;
  height: 150rpx;
  line-height: 150rpx;
}

.home-flex {
  display: flex;
  align-items: center;
  column-gap: 30rpx;

  &--item {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 208rpx;
    height: 208rpx;
    background: #f5f5ff;
    backdrop-filter: blur(20rpx);
    border-radius: 12rpx;
    font-size: $zy-font-size24;
    color: $zy-middle-color4;
    line-height: 60rpx;
    margin-left: 10rpx;
  }
}

.h5-main {
  margin: 60rpx 0;

  .h5-btn {
    width: 335rpx;
    text-align: center;
    background: $zy-main-color;
    border-radius: 12rpx;
    color: #ffffff;
    padding: 20rpx;
    margin: 10rpx 0;
    font-size: 28rpx;
  }
}
</style>
