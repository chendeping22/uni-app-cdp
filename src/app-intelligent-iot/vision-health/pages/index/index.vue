<template>
  <view class="home-page">
    <view class="home-main">
      <view class="home-flex">
        <view
          class="home-flex--item"
          @click="toPage('/app-intelligent-iot/vision-health/pages/check/index')"
        >
          <image
            style="width: 64rpx; height: 64rpx"
            src="@/app-intelligent-iot/static/image/icon_check_work.png"
            mode=""
          />
          <view class="zy-margin-top-xs"> 检测工作 </view>
        </view>
        <view
          class="home-flex--item"
          style="background: #e7fcfa"
          @click="toPage('/app-intelligent-iot/vision-health/pages/questionnaire/index')"
        >
          <image
            style="width: 64rpx; height: 64rpx"
            src="@/app-intelligent-iot/static/image/icon_questionnaire.png"
            mode=""
          />
          <view class="zy-margin-top-xs"> 问卷调查 </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { showInfo } from '@/utils/tools';
// #ifdef MP-WEIXIN
import { onLoad } from '@dcloudio/uni-app';
import prompt from '@/app-intelligent-iot/vision-health/api/modules/prompt';

const Tip = '部分设备蓝牙连接功能受限，完整功能请下载麦塔校园APP';

const init = () => {
  prompt()
    .then(data => {
      if (data === false) {
        uni.showModal({
          content: Tip,
          showCancel: false,
          confirmText: '我知道了',
        });
      }
    })
    .catch(err => {
      console.error('error: ', err);
    });
};

onLoad(() => {
  init();
});
// #endif

// 页面路径跳转
const toPage = url => {
  $http.check
    .determineAppPermission()
    .then(res => {
      if (res) {
        uni.navigateTo({
          url: url,
        });
      } else {
        showInfo('非【视力筛查员】，请联系管理员添加角色');
      }
    })
    .catch(err => {});
};
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
