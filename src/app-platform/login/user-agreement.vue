<template>
  <page custom-overflow="scroll">
    <view class="content">
      <view class="text">
        <view v-for="(item, index) in userAgreement" :key="index" class="text-body">{{
          item
        }}</view>
      </view>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
  </page>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue';
import { userAgreementText } from './user-agreement';

export default defineComponent({
  setup() {
    const userAgreement = ref([] as string[]);

    const getAgreementText = () => {
      let text = userAgreementText;
      if (import.meta.env.VITE_APP_NAME !== '麦塔校园') {
        let reg = RegExp('麦塔校园', 'g');
        text = text.replace(reg, import.meta.env.VITE_APP_NAME);
      }
      const formatPrivacy = text.split('\n');
      userAgreement.value = formatPrivacy;
    };

    onBeforeMount(() => {
      getAgreementText();
    });

    return { userAgreement };
  },
});
</script>

<style lang="scss" scoped>
.content {
  padding: 25rpx 32rpx;
}

.text {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  overflow: hidden;
}

.text-body {
  background-color: #ffffff;
  color: #1d2129;
  text-indent: 56rpx;
}
</style>
