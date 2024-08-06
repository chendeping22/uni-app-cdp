<template>
  <view class="content-wrapper">
    <view class="header">
      <view class="title-wrapper">
        <view class="title-left">
          <text class="title">{{ detail?.title || '/' }}</text>
        </view>
      </view>

      <text class="time">{{
        detail?.createTime ? dayjs(detail?.createTime).format('YYYY-MM-DD HH:mm:ss') : '/'
      }}</text>
    </view>
    <view class="content-body">
      <view class="common-card">
        <preview-image
          mode="aspectFit"
          :src="detail?.snapImageUrl"
          class-name="alarm-detail-epidemic-image"
        />
      </view>

      <access-info :detail="detail" />
      <device-info :detail="detail" :alarm-type="AlarmTypeEnum.ACCESS" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import DeviceInfo from '@/app-school-safe/components/alarm-device-info/index.vue';
import PreviewImage from '@/app-school-safe/components/preview-image/index.vue';
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import {
  IAccessItemDetail,
  getAccessInOutNotificationDetail,
} from '@/app-school-safe/services/access-management';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, reactive } from 'vue';
import AccessInfo from './components/access-info/index.vue';

import dayjs from 'dayjs';

const detail: IAccessItemDetail = reactive({} as IAccessItemDetail);

// 获取通知
const getAlarmAndDetail = async (id: string, title: string) => {
  const res = (await getAccessInOutNotificationDetail(id)) || {};
  Object.assign(detail, res, {
    title,
  });
};

onBeforeMount(() => {
  const { id, title } = getPageParams();
  getAlarmAndDetail(id, title);
});
</script>

<style scoped lang="scss">
.content-wrapper {
  overflow-y: auto;

  .header {
    display: flex;
    flex-direction: column;
    background: $ui-color-white;
    padding: $ui-gap-default $ui-gap-large;
    border-bottom-left-radius: $ui-radius-xl;
    border-bottom-right-radius: $ui-radius-xl;
    .title-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title-left {
        display: flex;
        align-items: center;
        .title {
          font-size: $ui-font-size-xxt;
          color: $ui-color-base;
          letter-spacing: 0;
          line-height: 64rpx;
          font-weight: 600;
        }
      }
    }
    .content {
      font-size: $ui-font-size-content;
      color: $ui-color-base;
      letter-spacing: 0;
      line-height: 28rpx;
      margin: $ui-gap-small 0 $ui-gap-large;
    }
    .time {
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
      letter-spacing: 0;
      line-height: 24rpx;
    }
  }
  .content-body {
    padding: $ui-gap-large $ui-gap-large env(safe-area-inset-bottom);
  }
}
</style>
