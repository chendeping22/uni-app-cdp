<template>
  <view :class="[
    'container',
    currentUserType === guardianType ? 'u-m-t-32' : 'u-m-t-16',
    'u-m-l-32',
    'u-m-r-32',
    'u-p-t-24',
    'u-p-b-48',
  ]">
    <u-grid :border="false" :col="4">
      <u-grid-item v-for="(item, index) in list" :key="index" bg-color="#00000000" :customStyle="{ padding: '0px 0px' }"
        @click="selectItem(item)">
        <view class="grid-item-inner-box">
          <u-image :src="item.icon" width="64" height="64" :error-icon="applicationIcon" :show-loading="false"
            :fade="false"></u-image>
          <view class="grid-text u-font-26 u-m-t-8">{{ item.name }}</view>
        </view>

      </u-grid-item>
    </u-grid>
  </view>
</template>

<script lang="ts" setup>
import applicationIcon from '@/static/application.png';
import { loginStore } from '@/store/modules/login';
import type { IApplication } from '@/store/modules/workbench';
import { goToApplication } from '@/utils/go-to-application';
import { EUserType } from '@/utils/kind';
import { ref, toRefs } from 'vue';

/** 1. props定义 */
interface IProps {
  list: Array<IApplication>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), { list: () => [] });

const { currentUserType } = toRefs(loginStore());
const guardianType = ref(EUserType.guardian);

const selectItem = (item: IApplication) => {
  goToApplication(item);
};
</script>

<style scoped lang="scss">
.container {
  position: relative;
  border-radius: 16rpx;
  background: #ffffff7a;
  border: 1px solid #ffffffcc;
  box-shadow: 0px 1px 2px 0px #0000000a;
  overflow: hidden;
  z-index: 1;
}

.grid-text {
  @include ellipsis;
  width: 100%;
  text-align: center;
  color: #000000a6;
  font-size: 26rpx;
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.grid-item-inner-box {
  height: 140rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}
</style>
