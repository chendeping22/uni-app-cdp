<template>
  <page class="verson-update">
    <view class="update-img">
      <image :src="updateImg" class="img" />
    </view>
    <view class="title">请更新APP到最新版本</view>
    <view class="version">新版本：V{{ versionRes?.version }}</view>
    <view class="content"> {{ versionRes?.content }} </view>
    <view class="update-btn-area">
      <button class="update-btn" @click="update">更新</button>
    </view>
  </page>
</template>
<script lang="ts" setup>
import updateImg from '@/app-platform/static/mine/icon_version_updating.svg';
import type { AppVersionData } from '@/services/user';
import { confirmUpdate } from '@/utils/check-version';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, reactive } from 'vue';
const versionRes: AppVersionData = reactive({} as AppVersionData);

const update = () => {
  confirmUpdate(versionRes);
};

onBeforeMount(() => {
  const params = getPageParams();
  if (params) {
    Object.assign(versionRes, JSON.parse(decodeURIComponent(params?.versionRes)));
  }
});
</script>
<style lang="scss" scoped>
.verson-update {
  position: relative;
  .update-img {
    width: 100%;
    display: flex;
    justify-content: center;
    .img {
      width: 80%;
    }
  }
  .title {
    font-family: PingFangSC-Medium;
    font-size: 44rpx;
    color: #1d2129;
    letter-spacing: 0;
    text-align: center;
    line-height: 72rpx;
    font-weight: 600;
  }
  .version {
    font-family: PingFangSC-Regular;
    font-size: 30rpx;
    color: #4e5969;
    letter-spacing: 0;
    text-align: center;
    line-height: 48rpx;
  }
  .content {
    font-family: PingFangSC-Regular;
    font-size: 30rpx;
    color: #4e5969;
    letter-spacing: 0;
    line-height: 48rpx;
    white-space: pre-wrap;
    margin: 48rpx 25% 176rpx;
    word-break: break-all;
  }
  .update-btn-area {
    position: fixed;
    box-sizing: border-box;
    height: 176rpx;
    bottom: 0;
    width: 100%;
    background: #ffffff;
    padding: 32rpx 32rpx 72rpx;
    .update-btn {
      width: 100%;
    }
  }
}
</style>
