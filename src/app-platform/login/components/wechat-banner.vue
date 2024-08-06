<template>
  <view class="banner-box">
    <swiper class="banner-swiper" circular @change="bannerSwiperChange">
      <swiper-item v-for="(item, index) in datas" :key="index">
        <view class="banner-wrap">
          <image class="banner" :src="item.imageSrc"></image>
          <view class="text-title">
            <text>{{ item.title }}</text>
          </view>
          <view class="text-content">
            <text>{{ item.content }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>
    <swiper-dot class="dot" :current="bannerCurrent" :list="datas"></swiper-dot>
  </view>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { getLoginBannerList } from '../utils/index';
import swiperDot from './swiper-dot.vue';

export default defineComponent({
  components: {
    swiperDot,
  },
  props: {
    isGuardian: { type: Boolean, default: false },
    bannerCurrent: { type: Number, default: 0 },
  },
  emits: ['bannerSwiperChange'],
  setup(props, { emit }) {
    const datas = getLoginBannerList();
    console.log(datas);
    const bannerSwiperChange = (e: any) => {
      emit('bannerSwiperChange', e);
    };
    return { datas, bannerSwiperChange };
  },
});
</script>

<style scoped lang="scss">
.banner-box {
  position: relative;
  // overflow-y: auto;
  .dot {
    position: absolute;
    top: 620rpx;
    left: 300rpx;
  }
  .banner-swiper {
    box-sizing: border-box;
    padding-top: 115rpx;
    height: 900rpx;
    text-align: center;
    image {
      width: 524rpx;
      height: 472rpx;
    }
    .text-title {
      margin-top: 60rpx;
      margin-bottom: 24rpx;
      font-family: PingFangSC-Medium;
      font-size: 34rpx;
      color: #1d2129;
      text-align: center;
      line-height: 52rpx;
      font-weight: 600;
    }
    .text-content {
      margin: 0 auto;
      width: 500rpx;
      font-family: PingFangSC-Regular;
      font-size: 30rpx;
      color: #4e5969;
      text-align: center;
      line-height: 48rpx;
      font-weight: 400;
    }
  }
}
</style>
