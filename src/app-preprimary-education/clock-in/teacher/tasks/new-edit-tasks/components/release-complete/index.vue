<template>
  <CustomPage
    bg-type="clock-in"
    title="发布完成"
    :auto-back="false"
    :back-icon="true"
    :click-left="() => handleBackToTasks(backUrl)"
  >
    <view class="image-wrap">
      <image class="result-image" :src="icon_success" />
    </view>
    <view class="result-text">打卡发布成功</view>
    <view class="btn">
      <ImpButton
        width="400rpx"
        type="warnning"
        @click="() => handleBackToTasks('app-preprimary-education/clock-in/teacher/tasks/index')"
      >
        返回打卡列表
      </ImpButton>
    </view>
    <view class="btn">
      <ImpButton width="400rpx" @click="handleBackToHome">返回首页</ImpButton>
    </view>
  </CustomPage>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import icon_success from '@/app-preprimary-education/static/svg/icon_success.svg';
import { getPageParams } from '@/utils/tools';
import { computed, defineComponent } from 'vue';
export default defineComponent({
  components: { CustomPage, ImpButton },
  setup() {
    const handleBackToTasks = (url: string) => {
      const pages = getCurrentPages();
      // 因为打卡的入口多，通过查找任务列表的位置来动态跳转
      const index = pages.reverse().findIndex(p => p.route?.includes(url));
      if (index < 0) {
        uni.reLaunch({
          url: `/${url}`,
        });
        return;
      }
      uni.navigateBack({
        delta: index,
      });
    };
    const handleBackToHome = () => {
      uni.reLaunch({
        url: '/pages/workbench/index',
      });
    };
    const backUrl = computed(() => {
      const params = getPageParams();
      return params.id
        ? 'app-preprimary-education/clock-in/teacher/detail/index'
        : 'app-preprimary-education/clock-in/teacher/tasks/choose-template/index';
    });
    return { handleBackToTasks, handleBackToHome, icon_success, backUrl };
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
