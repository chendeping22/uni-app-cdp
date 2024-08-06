<template>
  <view>
    <u-image
      :src="start"
      :loading-icon="start"
      :width="width + 'px'"
      :height="height + 'px'"
      mode="aspectFill"
    ></u-image>
  </view>
</template>

<script setup lang="ts">
import start from '@/static/welcome/start.jpg';
import { loginStore } from '@/store/modules/login';

const info = uni.getSystemInfoSync();
const width = info.screenWidth;
const height = info.screenHeight;

let url = '/app-platform/login/index';
const refreshLogin = async () => {
  try {
    const res = await loginStore().verifyLogin();
    console.log('refreshLogin result', res);

    url = '/pages/workbench/index';
  } catch (error) {
    console.log('refreshLogin err', error);
  }

  uni.reLaunch({
    url: url,
    success: () => {},
  });
};

refreshLogin();
</script>

<style></style>
