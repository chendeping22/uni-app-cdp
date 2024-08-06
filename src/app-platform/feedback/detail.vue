<template>
  <view v-if="!loading" class="u-m-l-32 u-m-r-32 u-m-t-24 u-m-b-24 u-p-32 container">
    <view class="feed" v-if="data.content">
      <view class="avatar">问</view>
      <view class="time footnote-medium u-m-b-16">{{ data.occurrenceTime }}</view>
      <view class="subheadline-medium">{{ data.content }}</view>
      <template v-if="data.imagePaths && data.imagePaths.length">
        <view class="image-list">
          <view
            v-for="(url, idx) in data.imagePaths"
            :key="idx"
            class="image-wrap"
            :style="{ backgroundImage: `url(${url})` }"
            @click="handleClickImgs(data.imagePaths, idx)"
          ></view>
        </view>
      </template>
      <template v-if="data.videoPath">
        <view class="video-wrap">
          <video :src="data.videoPath" controls></video>
        </view>
      </template>
    </view>
    <view class="divider"></view>
    <view class="reply" v-if="data.replyContent">
      <view class="avatar">答</view>
      <view class="time footnote-medium u-m-b-16">{{ data.replyTime }}</view>
      <view class="subheadline-medium">{{ data.replyContent }}</view>
      <template v-if="data.replyImagePaths && data.replyImagePaths.length">
        <view class="image-list">
          <view
            v-for="(url, idx) in data.replyImagePaths"
            :key="idx"
            class="image-wrap"
            :style="{ backgroundImage: `url(${url})` }"
            @click="handleClickImgs(data.replyImagePaths, idx)"
          ></view>
        </view>
      </template>
      <template v-if="data.replyVideoPath">
        <view class="video-wrap">
          <video :src="data.replyVideoPath" controls></video>
        </view>
      </template>
    </view>
  </view>
  <view class="safe-area-inset-bottom" style="height: 1px"></view>
</template>

<script setup lang="ts">
import { request } from '@/utils/request';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const loading = ref<boolean>(true);
const data = ref<any>({});

const fetch = (id: string) => {
  loading.value = true;
  request(`/feedback/${id}`, undefined, 'GET', {
    spaceType: request.service.data,
    showLoading: true,
    overdueShowLoadingTime: 0,
  })
    .then(detail => {
      data.value = detail;
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleClickImgs = (urls: string[], current: number) => {
  uni.previewImage({
    urls,
    current,
  });
};

onLoad(options => {
  if (options && options.id) fetch(options.id);
});
</script>

<style lang="scss" scoped>
.container {
  background-color: #fff;
  border-radius: $radius-ms;
}
.feed,
.reply {
  position: relative;
  margin-left: 80rpx;
}
.avatar {
  @include footnote-medium;
  position: absolute;
  top: 0;
  left: -80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 48rpx;
  border-radius: 16rpx;
  color: #fff;
}

.feed {
  .avatar {
    background-color: #4096ff;
    border-radius: 16rpx 16rpx 16rpx 0;
  }
}

.reply {
  .avatar {
    background-color: #52c41a;
    border-radius: 16rpx 16rpx 0 16rpx;
  }
}
.divider {
  width: 100%;
  height: 1px;
  margin: 32rpx 0;
  background-color: rgba(0, 0, 0, 0.06);
}

.time {
  color: rgba(0, 0, 0, 0.65);
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}
.image-wrap {
  display: block;
  overflow: hidden;
  width: 160rpx;
  height: 160rpx;
  margin-top: 16rpx;
  margin-left: 16rpx;
  background-color: #000;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: $radius-sm;
  cursor: pointer;

  &:nth-child(3n + 1) {
    margin-left: 0;
  }
}
.video-wrap {
  margin-top: 16rpx;
  background-color: #000;
  video {
    display: block;
    width: 100%;
    height: 300rpx;
  }
}
</style>
