<template>
  <view class="container u-m-l-32 u-m-r-32 u-m-t-24">
    <u-swiper-custom
      :border-radius="16"
      height="294"
      :list="list"
      :title="true"
      interval="5000"
      :autoplay="list.length > 1"
      :mode="list.length > 1 ? 'round' : ''"
      :title-style="{ height: list.length > 1 ? '96rpx' : '72rpx' }"
      @click="clickBannner"
    ></u-swiper-custom>
  </view>
  <imp-mqtt-subscriber :topics="TOPICS" @init="mqttInit" @message="onMessage" />
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { workbenchStore } from '@/store/modules/workbench';
import MQTT_TOPICS from '@/utils/mqtt/mqtt.topics';
import { computed, toRefs } from 'vue';

/** 3. your code here! */
const { bannerList } = toRefs(workbenchStore());
const { currentOrganization } = toRefs(loginStore());
const list = computed(() => {
  const resultList = bannerList.value.map(banner => {
    return { image: banner.url, title: banner.title, banner };
  });
  return resultList.length < 8 ? resultList : resultList.slice(0, 7);
});

const clickBannner = (index: number) => {
  const banner = encodeURIComponent(JSON.stringify(bannerList.value[index]));
  uni.navigateTo({
    url: `/app-platform/workbench/banner-article?banner=${banner}`,
    fail(result) {
      console.log(result);
    },
  });
};

// mqtt主题
const TOPICS = [MQTT_TOPICS.MOBILE_BANNER_PUBLISH];

// init 事件接收参数包含这四个方法，与 react 中注入的同名方法使用一致
const mqttInit = (item: { notifySubOrUnSubToEndApi: any; manualSubOrUnsub: any }) => {
  const { notifySubOrUnSubToEndApi } = item;
  notifySubOrUnSubToEndApi(true, {
    topic: MQTT_TOPICS.MOBILE_BANNER_PUBLISH,
    bid: currentOrganization.value?.id,
  });
};

// message 事件接收推送消息, 返回格式为 { message: any, topic: string };
const onMessage = (receiveMsg: any) => {
  const { message, topic } = receiveMsg;
  console.log('notify/mobileBannerPublish receive:', message, topic, currentOrganization.value?.id);
  if (message.locationId.toString() === currentOrganization.value?.id) {
    workbenchStore().fetchBannersData(false);
    console.log('更新banner', message);
  } else {
    console.log('非当前组织不更新banner', message);
  }
};
</script>

<style scoped lang="scss">
.container {
  z-index: 1;
}
</style>
