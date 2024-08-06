<template>
  <view class="container bg-fill-default ptb-b plr-l">
    <view class="bg-img">
      <view class="name">
        <image :src="recordInfo?.icon" alt="icon" class="icon" />
        <view class="text">{{
          recordInfo?.archiveTypeName
            ? recordInfo?.faceArchiveDetailResp?.personName
            : recordInfo?.libraryTypeName
        }}</view>
      </view>
      <view class="time">{{ captureTimeStr }}</view>
      <image :src="recordInfo?.captureImgUrl" alt="抓拍图" class="bg" />
      <!-- <image :src="recordInfo.value.snapImgUrl" alt="抓拍图" class="bg" /> -->
    </view>
    <view class="info-wrap">
      <view class="similarity">
        <view>相似度:</view>
        <view class="percent">{{ recordInfo?.similarity }}%</view>
      </view>
      <view class="imgs">
        <view class="img">
          <image :src="recordInfo?.faceCaptureImgUrl" alt="抓拍图" class="bg" />
          <view class="text">抓拍图</view>
        </view>
        <view class="img">
          <image :src="recordInfo?.faceArchiveDetailResp?.coverUrl" alt="底库图" class="bg" />
          <view class="text">底库图</view>
        </view>
      </view>
      <view class="person-info">
        <view class="title">人员信息</view>
        <view class="desc">
          <view class="label"> 身份</view>
          <view class="value">
            {{
              PersonTypeEnum.find(
                item => item.value === recordInfo?.faceArchiveDetailResp?.personType,
              )?.label || '/'
            }}</view
          >
        </view>
        <view class="desc">
          <view class="label"> 档案标签</view>
          <view v-if="recordInfo?.faceArchiveDetailResp?.labelNames?.length == 0">/</view>
          <c-tag-group v-else>
            <c-tag-item
              v-for="item in recordInfo?.faceArchiveDetailResp?.labelNames"
              :key="item"
              :is-brand-color="false"
              :text="item"
              height="96rpx"
              lr-padding-type="s"
            />
          </c-tag-group>
        </view>
      </view>
      <view class="line"></view>
      <view v-if="recordInfo?.faceInfoDTO?.properties?.length" class="face-properties">
        <c-tag-group>
          <c-tag-item
            v-for="item in recordInfo?.faceInfoDTO?.properties"
            :key="item"
            :is-brand-color="false"
            :text="item"
            height="96rpx"
            lr-padding-type="s"
          />
        </c-tag-group>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import {
  ICaptureRecordInfo,
  fetchCaptureRecordDetail,
} from '@/app-school-safe/services/monitoring';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, onBeforeMount, ref } from 'vue';
import PersonTypeEnum from './constants/PersonTypeEnum';
import usePersonType from './hooks/usePersonType';
const recordId = ref<string>();
const libraryType = ref<string>();
const recordInfo = ref<ICaptureRecordInfo>();

const getRecordDetail = async () => {
  if (!recordId.value?.length) return;
  const res = await fetchCaptureRecordDetail(recordId.value);
  recordInfo.value = res
    ? {
        ...res,
        ...usePersonType(libraryType.value, res.faceArchiveDetailResp.personType),
        libraryType,
      }
    : {};
};

const captureTimeStr = computed(() => {
  const currentDate = dayjs(recordInfo.value?.captureTime);
  if (currentDate.isSame(dayjs(new Date()), 'date')) return currentDate.format('HH:mm:ss');
  else if ((currentDate.isSame(dayjs(new Date()).subtract(1, 'day')), 'date'))
    return `昨天${currentDate.format('HH:mm:ss')}`;
  else return currentDate.format('YYYY-MM-DD HH:mm:ss');
});

onBeforeMount(() => {
  const params = getPageParams();
  recordId.value = params.id;
  libraryType.value = params.libraryType ? parseInt(params.libraryType) : null;

  getRecordDetail();
});
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - var(--status-bar-height));
  overflow: auto;
}

.bg-img {
  background: $ui-color-white;
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-xl;
  padding: $ui-gap-default $ui-gap-large;
  .name {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 42rpx;
    line-height: 42rpx;
    .icon {
      width: 32rpx;
      height: 32rpx;
    }
    .text {
      height: 42rpx;
      font-family: PingFangSC-Medium;
      font-size: $ui-font-size-title;
      color: $ui-color-base;
      font-weight: bold;
      margin-left: $ui-gap-small;
    }
  }
  .time {
    height: 33rpx;
    font-family: PingFangSC-Regular;
    font-size: $ui-font-size-secondary;
    color: $ui-color-placeholder;
    margin: $ui-gap-xxs 0 $ui-gap-small $ui-gap-xl;
  }
  .bg {
    width: 100%;
    height: 360rpx;
    background: $ui-color-black;
    border-radius: $ui-radius-large;
  }
}
.info-wrap {
  background: $ui-color-white;
  box-shadow: 0px 0px 20rpx 0px rgba($ui-color-base, 0.05);
  border-radius: $ui-radius-xl;
  margin: $ui-gap-default 0;
  padding: $ui-gap-large;

  .similarity {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 88rpx;
    background: rgba($ui-color-base, 0.03);
    border-radius: $ui-radius-xl;
    font-size: $ui-font-size-xt;
    letter-spacing: 0;
    text-align: center;
    line-height: 34rpx;
    font-weight: 600;
    .percent {
      color: $ui-color-primary;
    }
  }
  .imgs {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    .img {
      background: rgba($ui-color-base, 0.03);
      border-radius: $ui-radius-xl;
      .bg {
        width: 262rpx;
        height: 367rpx;
        border-radius: $ui-radius-xl;
      }
      .text {
        height: 80rpx;
        line-height: 80rpx;
        font-family: PingFangSC-Medium;
        font-size: $ui-font-size-title;
        color: $ui-color-placeholder;
        text-align: center;
        font-weight: 500;
      }
    }
  }
  .person-info {
    margin-top: $ui-gap-large;
    .title {
      height: 30rpx;
      font-size: $ui-font-size-title;
      color: $ui-color-base;
      line-height: 30rpx;
      font-weight: bold;
      margin-bottom: $ui-gap-xxs;
    }
    .desc {
      display: flex;
      flex-wrap: nowrap;
      margin: $ui-gap-small 0;
      .label {
        width: 140rpx;
        flex-basis: 140rpx;
        font-size: $ui-font-size-title;
        color: $ui-color-placeholder;
        flex-shrink: 0;
      }
      .value {
        height: 42rpx;
        font-size: $ui-font-size-title;
        color: $ui-color-base;
        font-weight: 400;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        .tag-item {
          line-height: 48px;
          background: $ui-color-fill-default;
          border-radius: 28rpx;
          margin-right: $ui-gap-small;
          margin-bottom: $ui-gap-small;
          padding: 0 $ui-gap-xs;
          font-size: $ui-font-size-title;
        }
      }
    }
  }
  .line {
    height: 1rpx;
    background: $ui-color-fill-deep;
  }
  .face-properties {
    margin: $ui-gap-default 0;
    ::v-deep {
      .c-tag-item-tag-text {
        color: $uni-color-primary;
      }
    }
  }
}
</style>
