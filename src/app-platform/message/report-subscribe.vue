<template>
  <page>
    <u-card
      margin="30rpx"
      :border="false"
      :padding="20"
      :head-border-bottom="false"
      :show-head="false"
    >
      <template #body>
        <view>
          <view class="flex-between height-button-xxs">
            <view class="color-base font-xxt bold">{{ detail.title }}</view>
            <view class="color-placeholder font-content">{{ detail.createTime }}</view>
          </view>
          <view class="flex mtb-b">
            <image :src="icon_pdf" class="icon-48 mr-s" />
            <view class="color-secondary font-content">{{ detail.attachmentName }}</view>
          </view>
          <view class="font-content">请点击下载查看！</view>
        </view>
      </template>
    </u-card>
    <view class="icon-64"></view>
    <view class="btn-wrap">
      <c-button custom-style="border-radius: 48rpx" @click="download_pdf(detail.attachmentId)">
        下载
      </c-button>
    </view>
  </page>
</template>
<script lang="ts" setup>
import icon_pdf from '@/app-platform/static/message/icon_pdf.svg';
import { download_pdf } from '@/utils/download';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, ref } from 'vue';

interface IDetail {
  title: string;
  createTime: number;
  content: string;
  attachmentId: string;
  attachmentName: string;
}
interface IPage {
  detail: string;
}

const detail = ref({} as IDetail);

onBeforeMount(() => {
  const params = getPageParams<IPage>();
  detail.value = JSON.parse(params.detail);
  console.log('detail.value : ' + JSON.stringify(detail.value));
});
</script>
<style lang="scss" scoped>
.bold {
  font-weight: 600;
}
.flex {
  display: flex;
  align-items: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.height-button-xxs {
  height: 64rpx;
}
.mtb-b {
  margin-top: 24rpx;
  margin-bottom: 24rpx;
}
.mr-s {
  margin-right: 16rpx;
}
.color-base {
  color: #1d2129;
}
.color-secondary {
  color: #4e5969;
}
.color-placeholder {
  color: #86909c;
}
.font-xxt {
  font-size: 40rpx;
}
.font-content {
  font-size: 28rpx;
}
.icon-48 {
  width: 48rpx;
  height: 48rpx;
}
.icon-64 {
  width: 64rpx;
  height: 64rpx;
}
.btn-wrap {
  margin-left: 5%;
  margin-right: 5%;
}
</style>
