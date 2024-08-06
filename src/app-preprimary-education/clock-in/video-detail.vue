<template>
  <mt-page
    class="bg-white"
    title="详情"
    theme="default"
    :show-bottom-gap="false"
    :show-top-gap="false"
  >
    <video :src="resourceFileURL" class="w100" @play="handlePlay" />
  </mt-page>
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { getPageParams, showInfo } from '@/utils/tools';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';

import { loginStore } from '@/store/modules/login';
import { onLoad } from '@dcloudio/uni-app';

const loginSt = loginStore();

const resourceFileURL = ref();

const handlePlay = () => {
  handleNetworkStatusChange();
};

const init = () => {};
onLoad(() => {
  const { fileUrl } = getPageParams();
  resourceFileURL.value = fileUrl;
});

const handleNetworkStatusChange = (res?: OnNetworkStatusChangeSuccess) => {
  if (res && !res.isConnected) {
    showInfo('网络已断开');
    return;
  }
  uni.getNetworkType({
    complete(res: any) {
      const networkType = res.networkType || 'none';
      if (networkType === 'none') {
        showInfo('当前无网络');
        return;
      }
      if (/\dg/.test(networkType)) {
        showInfo('注意！您正在使用流量！');
        return;
      }
    },
  });
};

onBeforeMount(() => {
  handleNetworkStatusChange();
  uni.onNetworkStatusChange(handleNetworkStatusChange);
  init();
});
onBeforeUnmount(() => {
  uni.offNetworkStatusChange(handleNetworkStatusChange);
});
</script>
<style scoped>
.bg-style {
  background-color: #f2f3f4;
  border-radius: 24rpx;
}
</style>
