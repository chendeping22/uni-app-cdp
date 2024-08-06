<template>
  <page custom-overflow="scroll">
    <view class="u-p-t-12 u-p-b-12">
      <l-drag
        ref="widgetDragRef"
        :list="initWidgets"
        grid-height="152rpx"
        :column="1"
        :touch-handle="touchHandle"
        handle
        @change="change"
      >
        <template #grid="{ active, content, index, oindex }">
          <view class="grid">
            <view class="cell inner" :class="{ active }">
              <u-image
                :src="content.applicationLogoUrl"
                width="64"
                height="64"
                :show-loading="false"
                :error-icon="applicationIcon"
                :fade="false"
              ></u-image>
              <view class="u-flex-1 u-m-l-32 u-m-r-32">
                <view class="title">{{ content.title }}</view>
                <view class="subTitle">{{ content.applicationName }}</view>
              </view>
              <view
                class="u-flex"
                style="height: 100rpx"
                @touchstart="touchHandle = true"
                @touchend="touchHandle = false"
                ><u-icon :name="move" size="48"></u-icon
              ></view>
            </view>
          </view>
        </template>
      </l-drag>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import move from '@/app-platform/static/workbench/icon_move.svg';
import applicationIcon from '@/static/application.png';
import { workbenchStore } from '@/store/modules/workbench';
import { onUnload } from '@dcloudio/uni-app';
import { ref, toRefs } from 'vue';
import lDrag from '../components/l-drag/l-drag.vue';

/** 3. your code here! */
const store = workbenchStore();
const { workbench } = toRefs(store);
const touchHandle = ref(false);
const widgetDragRef = ref(null);
const initWidgets = workbench.value.widgets || [];
const isHaveChange = ref(false);

const change = (items: any[]) => {
  isHaveChange.value = true;
  const widgets = items.map(item => item.content);
  workbenchStore().updateWorkbenchWidgetSortCache(widgets);
};
onUnload(() => {
  if (isHaveChange.value) {
    workbench.value.widgets = workbenchStore().workbenchWidgetSortByLocalCache(
      workbench.value.widgets,
    );
  }
});
</script>

<style scoped lang="scss">
:deep(.u-title) {
  font-weight: 500 !important;
}

.grid {
  height: 100%;
  /* #ifdef APP-NVUE */
  flex: 1;
  /*  #endif */
  /* #ifndef APP-NVUE */
  width: 100%;
  /*  #endif */
  padding: 12rpx 32rpx;
  box-sizing: border-box;
  position: relative;
}

.cell {
  height: 128rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  background-color: white;
}
.inner {
  justify-content: space-between;
  transition: all 300ms ease;
  position: relative;
  padding: 12rpx 32rpx;
}

.title {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  height: 44rpx;
  line-height: 44rpx;
}

.subTitle {
  color: #00000073;
  font-size: 26rpx;
  font-style: normal;
  line-height: 36rpx;
  height: 36rpx;
}
.active {
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 3;
  .custom-button {
    margin: 24rpx 32rpx 0;
    height: 80rpx;
    color: white;
    font-size: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    border-radius: 16rpx;
    background: $ui-color-primary;
  }

  .color-primary-disable {
    background: #91caff;
  }
  .u-fixed-placeholder {
    /* #ifndef APP-NVUE */
    box-sizing: content-box;
    /* #endif */
  }
}
</style>
