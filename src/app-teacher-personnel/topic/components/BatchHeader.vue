<template>
  <view class="white-block">
    <view class="tip">批次：</view>
    <view class="title">
      <text class="title-text">【{{ getLevelName(data?.level) }}】{{ data?.title }}</text>
    </view>
    <view class="desc flex-between">
      <view class="desc-left"> {{ data?.publisher }}（{{ data?.locationName }}） </view>
      <view class="desc-right">
        {{ dayjs(props.data?.createTime).format('YYYY-MM-DD HH:mm') }} 发布
      </view>
    </view>
    <Descriptions
      :dictionaries="{}"
      empty-placeholder="-"
      :record="data"
      :items="[
        { field: 'quota', label: '配额说明' },
        {
          field: 'memberLimit',
          label: '课题组成员上限',
          format(value) {
            return (value ?? '-') + '人';
          },
        },
      ]"
    ></Descriptions>
    <template v-if="showStage">
      <view class="file-text">阶段信息</view>
      <view class="stage-list">
        <view v-for="(one, index) in items" :key="one.title" class="stage-one flex">
          <view class="circle flex-center">{{ index + 1 }}</view>
          <view class="stage-name">{{ one.title }}</view>
          <view class="stage-time">
            {{ dayjs(data?.materials[index]?.deadline).format('YYYY-MM-DD HH:mm') }}截止
          </view>
        </view>
      </view></template
    >
    <template v-if="data?.attachmentList?.length > 0">
      <view class="file-text">附件</view>
      <UploadFile
        :max-count="1"
        :default-file-list="
          data?.attachmentList?.map(f => ({
            fileId: f.fileId,
            name: f.fileName,
            url: f.fileUrl,
          }))
        "
        :disabled="true"
      ></UploadFile>
    </template>
  </view>
</template>

<script setup lang="ts">
import Descriptions from '@/app-teacher-personnel/topic/components/descriptions/index.vue';
import UploadFile from '@/app-teacher-personnel/topic/components/upload/UploadFile.vue';
import dayjs from 'dayjs';
import { getLevelName } from '../helper/utils';

//传参
const props = defineProps({
  data: Object,
  showStage: {
    type: Boolean,
    default: false,
  },
});

const items = [
  {
    title: '课题申报',
  },
  {
    title: '开题论证',
  },
  {
    title: '中期检查',
  },
  {
    title: '结题鉴定',
  },
];
</script>

<style scoped lang="scss">
.white-block {
  background-color: #fff;
  border-radius: px2rpx(8px);
  box-shadow: 0 1px 2px 0 #0000000a;
  padding: px2rpx(12px) px2rpx(16px);
  .tip {
    color: rgba($color-text-base, 0.45);
    @include caption-1-regular;
    margin-bottom: px2rpx(4px);
  }
  .title {
    margin-bottom: px2rpx(4px);
    .title-text {
      word-break: break-word;
      @include body-medium;
    }
    .title-tag {
      margin-left: px2rpx(8px);
    }
  }
  .desc {
    padding-bottom: px2rpx(12);
    border-bottom: 1rpx solid #0000000f;
    &-left {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: rgba($color-text-base, 0.65);
      @include footnote-regular;
    }
    &-right {
      flex: none;
      color: rgba($color-text-base, 0.45);
      @include caption-1-regular;
    }
  }
  .file-text {
    @include subheadline-regular;
    margin: px2rpx(16) 0 px2rpx(8);
  }
  .stage-list {
    .stage-one + .stage-one {
      margin-top: px2rpx(8);
    }
    .circle {
      height: px2rpx(18);
      width: px2rpx(18);
      color: #fff;
      border-radius: 50%;
      background-color: $color-primary;
      flex: none;
    }
    .stage-name {
      @include subheadline-regular;
      margin-left: px2rpx(8);
      flex: 1;
    }
    .stage-time {
      @include footnote-regular;
      color: rgba($color-text-base, 0.45);
      flex: none;
    }
  }
}
</style>
