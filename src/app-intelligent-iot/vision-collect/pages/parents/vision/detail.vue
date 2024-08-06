<template>
  <view class="page">
    <view class="title-name">{{ detail.title }}</view>
    <view class="title-time zy-flex zy-flex-col-center">
      <view class="title-status"> 近视防控 </view>
      <view class=""> {{ formatDate(detail?.updateTime) }} </view>
    </view>
    <view class="text-content">
      <rich-texts :strings="detail?.content?.content" />
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { formatDate } from '@/app-intelligent-iot/vision-health/utils/formatDate';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import richTexts from '../components/rich-texts.vue';
const { proxy } = getPublicFuncProxy();
const detail = ref({
  title: '',
  updateTime: '',
  content: {
    content: '',
  },
});

const getScienceOutreachs = bizid => {
  $http.parents
    .scienceOutreachsRead({
      id: bizid,
    })
    .then(res => {
      detail.value = res;
    })
    .catch(err => {});
};
onLoad(option => {
  getScienceOutreachs(option.id);
});
</script>

<style lang="scss" scoped>
.page {
  padding: 30rpx;
}

.title-name {
  font-size: 34rpx;
  color: #1d2129;
  text-align: left;
  line-height: 52rpx;
  font-weight: 600;
  margin: 20rpx 0 10rpx 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.title-time {
  font-size: 26rpx;
  color: #86909c;
  text-align: left;
  line-height: 36rpx;
  font-weight: 400;
  padding-bottom: 20rpx;
}

.title-status {
  padding: 5rpx 20rpx;
  margin-right: 20rpx;
  background: #e8f7ff;
  border-radius: 12rpx;
  color: #3491fa;
}
</style>
