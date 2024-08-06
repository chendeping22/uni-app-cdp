<template>
  <page
    title="发布完成"
    bg-type="clock-in"
    :auto-back="false"
    :back-icon="true"
    :click-left="handleBackToDetail"
  >
    <view class="image-wrap">
      <image class="result-image" :src="icon_success" />
    </view>
    <view class="result-text">打卡完成</view>
    <view class="btn">
      <c-button width="400rpx" type="warnning" @click="handleBackToTasks"> 返回打卡列表 </c-button>
    </view>
    <view class="btn">
      <c-button type="primary" width="400rpx" @click="handleBackToHome">返回首页</c-button>
    </view>
  </page>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import icon_success from '@/app-preprimary-education/static/svg/icon_success.svg';
import { clockinDetailEffectOnShow_key } from '@/utils/storage-keys';
import { defineComponent } from 'vue';
export default defineComponent({
  components: { ImpButton },
  setup() {
    const handleBackToTasks = () => {
      const pages = getCurrentPages();
      // 因为打卡的入口多，通过查找任务列表的位置来动态跳转
      const index = pages
        .reverse()
        .findIndex(p =>
          p.route?.includes('app-preprimary-education/clock-in/guardian/tasks/index'),
        );
      if (index < 0) {
        uni.reLaunch({
          url: '/app-preprimary-education/clock-in/guardian/tasks/index',
        });
        return;
      }
      uni.navigateBack({
        delta: index,
      });
    };
    const handleBackToDetail = () => {
      uni.setStorageSync(clockinDetailEffectOnShow_key, true);
      uni.navigateBack({
        delta: 2,
      });
    };
    const handleBackToHome = () => {
      uni.reLaunch({
        url: '/pages/workbench/index',
      });
    };
    return { handleBackToTasks, handleBackToHome, handleBackToDetail, icon_success };
  },
});
</script>
<style lang="scss" scoped>
.image-wrap {
  display: flex;
  justify-content: center;
  margin-top: 164rpx;
  margin-bottom: $ui-gap-large;
  .result-image {
    width: 106rpx;
    height: 106rpx;
  }
}

.result-text {
  font-size: $ui-font-size-xxxt;
  color: $ui-color-base;
  text-align: center;
  margin: $ui-gap-large 0;
  font-weight: $ui-font-weight-bold;
}
.btn {
  margin: $ui-gap-large 0;
  display: flex;
  justify-content: center;
}
</style>
