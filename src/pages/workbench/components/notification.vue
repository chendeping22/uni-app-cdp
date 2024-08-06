<script lang="ts" setup>
import { color_primary } from '@/styles/get-variables';
import { request } from '@/utils/request';
import { noticeUpdateTime } from '@/utils/storage-keys';
import { onBeforeMount, ref } from 'vue';

const content = ref<string>();
const updateTime = ref<number>();
const show = ref<boolean>();

const handleClose = () => {
  show.value = false;
  uni.setStorage({
    key: noticeUpdateTime,
    data: updateTime.value,
  });
};

onBeforeMount(() => {
  request('/anon/publishInfo', {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  }).then((data: any) => {
    if (data && data.status && data.content) {
      const time = uni.getStorageSync(noticeUpdateTime);
      if (!time || time !== data.updateTime) {
        content.value = data.content;
        updateTime.value = data.updateTime;
        // #ifdef APP-PLUS
        if (data.appScope) show.value = true;
        // #endif
        // #ifdef MP-WEIXIN || H5
        if (data.appletScope) show.value = true;
        // #endif
      }
    }
  });
});
</script>

<template>
  <view v-if="show && content" class="notification u-m-r-32 u-m-l-32 u-m-t-24 u-m-b-24">
    <uni-notice-bar
      v-if="show && content"
      single
      show-icon
      show-close
      scrollable
      :text="content"
      :color="color_primary"
      background-color="#ffffff"
      @close="handleClose"
    />
  </view>
</template>
