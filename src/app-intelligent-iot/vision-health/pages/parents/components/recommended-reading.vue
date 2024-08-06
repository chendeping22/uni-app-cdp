<template>
  <view class="">
    <view class="item-card">
      <view class="zy-flex zy-flex-col-center margin-sm">
        <image
          class="title-image"
          src="@/app-intelligent-iot/static/image/kePuXuanChuan.svg"
          mode="widthFix"
        />
        <view class="header-name"> 推荐阅读 </view>
      </view>

      <view v-if="isHaveData">
        <view v-for="(item, index) in arrList" :key="index" class="content">
          <!-- 视频 -->
          <view v-if="item?.contentType == 1" class="video-box">
            <view class="mt">
              <video class="video" :src="item?.sourceUrl" @play="clickNum(item)"></video>
            </view>
            <view class="title-name">{{ item?.title }}</view>
            <view
              :class="[
                'title-time zy-flex zy-flex-col-center',
                index + 1 === arrList.length ? null : 'bottom-line',
              ]"
            >
              <view class="mr"> {{ formatDate(item?.updateTime) }}</view>
              <view> 近视防控 </view>
            </view>
          </view>
          <!-- 富文本；外链 -->
          <view
            v-else-if="item?.contentType == 2 || item?.contentType == 3"
            :class="[
              'zy-flex zy-flex-col-center pad20',
              index + 1 === arrList.length ? null : 'bottom-line',
            ]"
            @click="toDetail(item)"
          >
            <view v-if="item?.sourceUrl">
              <image class="textarea-image mr" :src="item?.sourceUrl" />
            </view>
            <view class="">
              <view class="title-name">{{ item?.title }}</view>
              <view class="title-time zy-flex zy-flex-col-center">
                <view class="mr"> {{ formatDate(item?.updateTime) }} </view>
                <view> 近视防控 </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="content">
        <zy-empty />
      </view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { formatDate } from '@/app-intelligent-iot/vision-health/utils/formatDate';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
const { proxy } = getPublicFuncProxy();
const isHaveData = ref(true);
const arrList = ref([]);
const oldData = ref({});

const toDetail = datas => {
  clickNum(datas);
  if (datas?.contentType == 2) {
    //外链
    uni.navigateTo({
      url: `/pages/parents/vision/toLink?url=${encodeURIComponent(datas?.hyperLinks)}`,
    });
  } else {
    //富文本
    uni.navigateTo({
      url: `/pages/parents/vision/detail?id=${datas?.id}`,
    });
  }
};
const clickNum = datas => {
  const params = {
    sourceType: 2,
    personId: oldData.value?.bizid,
    scienceOutreachId: datas?.id,
    type: oldData.value?.type,
  };
  $http.parents
    .scienceOutreachsReadCount(params)
    .then(res => {})
    .catch(err => {
      isHaveData.value = false;
    });
};
const getScienceOutreachs = () => {
  $http.parents
    .scienceOutreachsRecommended()
    .then(res => {
      if (res && res.length) {
        isHaveData.value = true;
        arrList.value = res;
      } else {
        isHaveData.value = false;
      }
    })
    .catch(err => {
      isHaveData.value = false;
    });
};

onLoad(option => {
  oldData.value = option;
  getScienceOutreachs(option.bizid);
});
</script>

<style lang="scss" scoped>
.header-name {
  font-size: 34rpx;
  color: #1d2129;
  text-align: left;
  line-height: 52rpx;
  font-weight: 600;
}

.title-name {
  font-size: 34rpx;
  color: #1d2129;
  text-align: left;
  line-height: 52rpx;
  font-weight: 600;
  margin: 20rpx 0 8rpx 0;
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

.mr {
  margin-right: 20rpx;
}

.mt {
  margin-top: 20rpx;
}

.pad20 {
  padding: 15rpx 0;
}

.margin-sm {
  margin: 20rpx 0;
}

.title-image {
  width: 44rpx;
  height: 40rpx;
  margin-right: 24rpx;
}

.content {
  .video {
    width: 100%;
    height: 350rpx;
    border-radius: 10rpx;
  }
}

.bottom-line {
  border-bottom: 1px solid #ddd;
}

.textarea-image {
  width: 200rpx;
  height: 125rpx;
  border: 1rpx solid #ddd;
}
</style>
