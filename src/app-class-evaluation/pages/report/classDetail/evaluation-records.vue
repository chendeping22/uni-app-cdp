<template>
  <view class="eval-card">
    <view class="eval-item" v-for="item in list">
      <view class="eval-item-header">
        <view class="eval-item-type">
          <view class="eval-item-name">{{ item.indicatorName || item.content || '/' }}</view>
          <view :class="['eval-item-score', item.score < 0 ? 'score-reduce' : 'score-add']"
            >{{ item.score > 0 ? '+' : '' }}{{ item.score * item.commentTimes }}分</view
          >
        </view>
        <view v-if="item.associatedStudentNameList.length" class="eval-item-person">{{
          item.associatedStudentNameList.length > 3
            ? `${item.associatedStudentNameList.slice(0, 2).join('、')}共${
                item.associatedStudentNameList.length
              }人`
            : item.associatedStudentNameList.join('、')
        }}</view>
        <view class="eval-item-mes">
          <view class="eval-item-teacher"
            >由{{ item.evaluatorName }}{{ item.type === 0 ? '' : `[${item.abbreviation}]` }}点评{{
              item.commentTimes
            }}次</view
          >
          <view class="eval-item-time">{{
            getTime(item.evaluationDate, item.createTime) >
            dayjs().subtract(3, 'minute').unix() * 1000
              ? '刚刚'
              : `${dayjs(getTime(item.evaluationDate, item.createTime)).format(
                  'YYYY-MM-DD HH:mm',
                )} ${weekdays[dayjs(getTime(item.evaluationDate, item.createTime)).day()]}`
          }}</view>
        </view>
      </view>
      <view class="picture-video" v-if="item.fileInfo.length">
        <view class="picture-video-item" v-for="file in item.fileInfo">
          <video-snapshot-image
            v-if="file.type === 'video'"
            :fileUrl="file.videoFirstImageFileUrl"
            :file-id="file.fileId"
            @click="handleClickPreviewVideo(file)"
            :width="160"
            :height="106"
            :border-radius="8"
          ></video-snapshot-image>
          <u-image
            v-else
            @click="handleClickPreviewImages(item.fileInfo, file)"
            width="160rpx"
            height="106rpx"
            border-radius="8"
            :src="file.url"
          ></u-image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import VideoSnapshotImage from '@/app-class-evaluation/components/video-snapshot-image.vue';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import dayjs from 'dayjs';
interface IValue {
  url: string;
  type: 'image' | 'video';
  fileId: string;
  name: string;
  fileExtension: string;
}
const props = defineProps<{
  list: any[];
}>();
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const handleClickPreviewImages = (imageUrls: any, item: IValue) => {
  const urls = imageUrls.filter(i => i.type !== 'video').map(img => img.url);
  uni.previewImage({
    urls: urls,
    current: urls.findIndex(i => i === item.url),
  });
};
const getTime = (evaluationDate, createTime) => {
  return dayjs(
    dayjs(evaluationDate).format('YYYY-MM-DD') + ' ' + dayjs(createTime).format('HH:mm'),
  ).valueOf();
};
const handleClickPreviewVideo = (item: IValue) => {
  if (item.fileId) {
    callBridge({
      service: Service.file,
      action: Action.filePreview,
      data: {
        fileId: item.fileId,
      },
    });
  }
};
</script>

<style lang="scss" scoped>
.eval-card {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}
.eval-item {
  position: relative;
  padding: 24rpx 32rpx;
  &::before {
    position: absolute;
    bottom: 0;
    left: 32rpx;
    right: 0;
    content: '';
    display: block;
    height: 1rpx;
    background: #f1f1f1;
  }
  &-header {
    margin-bottom: 24rpx;
  }
  &-type,
  &-mes {
    display: flex;
    align-items: center;
  }
  &-person {
    margin: 8rpx 0;
    color: $color-text-label;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 36rpx;
  }
  &-name {
    flex: 1;
    margin-right: 16rpx;
    color: $color-text;
    font-family: 'PingFang SC';
    font-size: 30rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
  }
  &-score {
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
  }
  .score-reduce {
    color: $color-success;
  }
  .score-add {
    color: $color-error;
  }
  &-mes {
    color: $color-text-placeholder;
    font-family: 'PingFang SC';
    font-size: 24rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 32rpx;
  }
  &-teacher {
    flex: 1;
    margin-right: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.picture-video {
  display: flex;
  flex-wrap: wrap;
  &-item {
    position: relative;
    margin-right: 16rpx;
    &:nth-child(3n) {
      margin-right: 0;
    }
    &:nth-child(n + 4) {
      margin-top: 16rpx;
    }
  }
  .play {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -32rpx;
    margin-top: -32rpx;
  }
}
</style>
