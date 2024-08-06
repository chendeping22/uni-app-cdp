<template>
  <page custom-overflow="scroll">
    <view class="container">
      <view class="content">
        <view class="title">{{ banner?.title }}</view>
        <view class="subTitle">{{ banner ? commonDateStr(banner.publishTime) : '' }}</view>
        <view class="rich">
          <Dafter :modelValue="banner?.content" readonly />
        </view>
      </view>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
  </page>
</template>

<script lang="ts" setup>
import type { IBanner } from '@/store/modules/workbench';
import { formatDate, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getBannerDetail } from '../services/workbench';
import Dafter from '@/app-platform/infos/components/dafter/index.vue';

const banner = ref<IBanner>();
onLoad(option => {
  banner.value = JSON.parse(decodeURIComponent(option?.banner));
  console.log('banner:' + banner.value);
  loadData();
});

const loadData = async () => {
  try {
    showLoading();
    const res = await getBannerDetail(banner.value?.id ?? 0);
    if (res) {
      banner.value = res as IBanner;
    }
    hideLoading();
  } catch (error) {
    hideLoading();
    showInfo('获取校园资讯详情失败');
  }
};

uni.setNavigationBarTitle({
  title: '资讯详情',
});

const commonDateStr = (date: number) => {
  const today = new Date();
  const target = new Date(date);
  if (today.getFullYear() === target.getFullYear()) return formatDate(date, 'MM-DD hh:mm');
  return formatDate(date, 'YYYY-MM-DD hh:mm');
};
</script>

<style scoped lang="scss">
.container {
  padding: 24rpx 32rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 500;
  color: #000000e0;
}
.subTitle {
  font-size: 26rpx;
  color: #00000073;
  margin-top: 8rpx;
}

.rich {
  margin-top: 24rpx;
}
.content {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
}
</style>
