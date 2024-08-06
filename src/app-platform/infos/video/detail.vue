<script setup lang="ts">
import { querySchoolPublishInfosDetail } from '@/app-platform/services/infos';
import { formatDate } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { LOG_STATUS } from '../util';

const isFetching = ref<boolean>(true);
const showPopup = ref<boolean>(false);
const title = ref<string>('');
const videoUrl = ref<string>();
const posterUrl = ref<string>();
const detail = ref<{
  author: string;
  time: string;
  space: string;
}>();

const fetch = (id: string) =>
  querySchoolPublishInfosDetail(id)
    .then((data: any) => {
      if (data) {
        let pTime = data.publishTime ? formatDate(data.publishTime, 'YYYY-MM-DD hh:mm') : '审核中';
        pTime = data.status === LOG_STATUS.reviewing ? '审核中' : pTime;
        pTime = data.status === LOG_STATUS.verify_fail ? '校验失败' : pTime;
        pTime = data.status === LOG_STATUS.verifying ? '校验中' : pTime;

        title.value = data.title;
        detail.value = {
          author: data.createName,
          time: pTime,
          space: data.spaceNames.join(', '),
        };
        if (Array.isArray(data.fileList)) {
          data.fileList.forEach(item => {
            if (item.type === 1) {
              videoUrl.value = item.fileUrl;
            } else {
              posterUrl.value = item.fileUrl;
            }
          });
        }
      }
    })
    .finally(() => {
      isFetching.value = false;
    });

onLoad(query => {
  if (query && query.id) {
    fetch(query.id);
  }
});
</script>

<template>
  <page custom-overflow="scroll">
    <view v-if="title && !isFetching" class="card">
      <view class="card-item-bg u-m-t-12">
        <view class="card-item-title body-medium">
          <text>{{ title }}</text>
          <u-icon
            name="info-circle"
            :custom-style="{ marginLeft: '16rpx' }"
            top="2"
            color="rgba(0, 0, 0, 0.45)"
            size="40"
            @click="showPopup = true"
          />
        </view>
        <view class="card-item__video">
          <view class="video-container">
            <!-- #ifndef MP-WEIXIN -->
            <video v-if="!showPopup" :src="videoUrl" :poster="posterUrl" autoplay></video>
            <view v-else class="video-cover"></view>
            <!-- #endif -->
            <!-- #ifdef MP-WEIXIN -->
            <video :src="videoUrl" :poster="posterUrl" autoplay></video>
            <!-- #endif -->
          </view>
        </view>
      </view>
    </view>
    <u-empty-custom v-else-if="!isFetching" :text="['信息不存在', '发布人已变更此信息']" />
    <u-popup v-if="detail" v-model="showPopup" mode="bottom" closeable border-radius="24">
      <view class="detail safe-area-inset-bottom">
        <view class="detail-title">详情</view>
        <view class="detail-item">
          <view class="detail-label subheadline-regular">发布人</view>
          <view class="detail-value body-regular">{{ detail.author || '-' }}</view>
        </view>
        <view v-if="detail.time" class="detail-item">
          <view class="detail-label subheadline-regular">发布时间</view>
          <view class="detail-value body-regular">{{ detail.time }}</view>
        </view>
        <view class="detail-item">
          <view class="detail-label subheadline-regular">显示空间</view>
          <view class="detail-value body-regular">{{ detail.space }}</view>
        </view>
      </view>
    </u-popup>
  </page>
</template>

<style lang="scss" scoped>
.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}
.video-container {
  position: relative;
  overflow: hidden;
  width: px2rpx(311);
  height: px2rpx(192);
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: $radius-base;

  video {
    width: 100%;
    height: 100%;
  }
}
.card {
  background: $color-bg-layout;
  padding: $space-size-ms $space-size-md;

  &-item-bg {
    background: $color-background-base;
    margin: $space-size-s 0;
    border-radius: $radius-base;
    overflow: hidden;
    padding: $space-size-ms $space-size-md;
  }

  &-item {
    padding: px2rpx(6px);
    padding-left: 0;

    &-title {
      min-height: 48rpx;
      overflow-wrap: break-word;
      word-wrap: break-word;
      white-space: normal;
    }

    &__video {
      margin-top: $space-size-md;
    }
  }
}

.detail {
  padding: px2rpx(12) px2rpx(16) px2rpx(16);
  &-title {
    text-align: center;
    @include headline-regular;
  }
  &-item {
    padding: px2rpx(16) 0;
    border-bottom: 1px solid $color-split;
  }
  &-label {
    color: $color-text-description;
  }
  &-value {
    margin-top: px2rpx(8);
    color: $color-text-heading;
  }
}
</style>
