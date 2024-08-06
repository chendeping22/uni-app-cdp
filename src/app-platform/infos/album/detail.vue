<script setup lang="ts">
import Upload from '@/app-platform/infos/components/upload/index.vue';
import { querySchoolPublishInfosDetail } from '@/app-platform/services/infos';
import { formatDate } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { LOG_STATUS } from '../util';

const isFetching = ref<boolean>(true);
const showPopup = ref<boolean>(false);
const title = ref<string>('');
const detail = ref<{
  author: string;
  time: string;
  space: string;
  imgs: { url: string; name: string }[];
}>();

const fetch = (id: string) =>
  querySchoolPublishInfosDetail(id)
    .then((data: any) => {
      if (data) {
        title.value = data.title;
        let imgs: any = [];

        if (Array.isArray(data.fileList)) {
          imgs = data.fileList.map((item: any) => {
            return {
              url: item.fileUrl,
              name: item.fileId,
            };
          });
        }

        let pTime = data.publishTime ? formatDate(data.publishTime, 'YYYY-MM-DD hh:mm') : '审核中';
        pTime = data.status === LOG_STATUS.reviewing ? '审核中' : pTime;
        pTime = data.status === LOG_STATUS.verify_fail ? '校验失败' : pTime;
        pTime = data.status === LOG_STATUS.verifying ? '校验中' : pTime;

        detail.value = {
          author: data.createName || data.auditorName || data.updateName,
          time: pTime,
          space: data.spaceNames.join(', '),
          imgs,
        };
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
          <text>
            {{ title }}
          </text>
          <u-icon
            v-if="!isFetching"
            name="info-circle"
            :custom-style="{ marginLeft: '16rpx' }"
            top="2"
            color="rgba(0, 0, 0, 0.45)"
            size="40"
            @click="showPopup = true"
          />
        </view>
        <view v-if="detail" class="card-item__video">
          <Upload :default-file-list="detail.imgs" :show-remove="false" />
        </view>
      </view>
    </view>
    <u-empty-custom v-else-if="!isFetching" :text="['信息不存在', '发布人已变更此信息']" />
    <u-popup v-if="detail" v-model="showPopup" mode="bottom" closeable border-radius="24">
      <view class="detail safe-area-inset-bottom">
        <view class="detail-title">详情</view>
        <view class="detail-item">
          <view class="detail-label">发布人</view>
          <view class="detail-value">{{ detail.author }}</view>
        </view>
        <view class="detail-item">
          <view class="detail-label">发布时间</view>
          <view class="detail-value">{{ detail.time }}</view>
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
  padding: $space-size-ms $space-size-md $space-size-md;
  &-title {
    text-align: center;
    @include headline-regular;
  }
  &-item {
    padding: $space-size-md 0;
    border-bottom: 1px solid $color-split;
  }
  &-label {
    color: $color-text-description;
  }
  &-value {
    margin-top: $space-size-base;
    color: $color-text-heading;
  }
}
</style>
