<template>
  <page custom-overflow="hidden">
    <view class="h100 scroll-hidden flex-column-plain">
      <view
        class="flex-stretch scroll-hidden"
        :style="{ display: currentTab === 1 ? 'block' : 'none' }"
      >
        <CurriculumSchedule />
      </view>
      <view
        v-if="adjustInit"
        class="flex-stretch scroll-hidden"
        :style="{ display: currentTab === 2 ? 'block' : 'none' }"
      >
        <CurriculumAdjust />
      </view>
      <view
        v-if="isPersonal === 0"
        class="no-shrink bg-white shadow flex-center safe-area-inset-bottom relative"
      >
        <view class="h-116 flex-stretch flex-column flex-center" @click="handleTabChange(1)">
          <image
            class="h-48 w-48"
            :src="currentTab === 1 ? IconCurriculumActive : IconCurriculum"
          />
          <view
            class="font-secondary"
            :style="{ color: currentTab === 1 ? '#1677FF' : 'rgba(0, 0, 0, 0.65)' }"
          >
            课表查询
          </view>
        </view>
        <view class="h-116 flex-stretch flex-column flex-center" @click="handleTabChange(2)">
          <image class="h-48 w-48" :src="currentTab === 2 ? IconAdjustActive : IconAdjust" />
          <view
            class="font-secondary"
            :style="{ color: currentTab === 2 ? '#1677FF' : 'rgba(0, 0, 0, 0.65)' }"
          >
            我的调代课
          </view>
        </view>
        <view
          class="add-button flex-center"
          :style="{
            left: positionX + 'px',
            top: positionY + 'px',
          }"
          @click="showAddPopup = true"
          @touchstart="handleAddTouchStart"
          @touchmove.stop.prevent="handleAddTouchMove"
        >
          <u-icon name="plus" color="#ffffff" size="40"></u-icon>
        </view>
      </view>
    </view>
  </page>
  <u-popup
    v-model="showAddPopup"
    mode="bottom"
    class="curriculum-popup-content"
    safe-area-inset-bottom
  >
    <view class="add-content">
      <view class="bg-white add-placeholder">请选择</view>
      <view class="bg-white add-item" @click="handleAdd">申请调课</view>
      <view class="bg-white add-item" @click="handlePlus">申请代课</view>
      <u-gap height="20" bg-color="rgba(0, 0, 0, 0.36)"></u-gap>
      <view class="bg-white confirm-btn" @click="showAddPopup = false">取消</view>
    </view>
  </u-popup>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { debounce } from '@/utils/lodash-es';
import { makeStorageKey } from '@/utils/storage-keys';
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import IconAdjustActive from '../static/course-info/adjust-active.svg';
import IconAdjust from '../static/course-info/adjust.svg';
import IconCurriculumActive from '../static/course-info/curriculum-active.svg';
import IconCurriculum from '../static/course-info/curriculum.svg';
import CurriculumAdjust from './curriculum-adjust.vue';
import CurriculumSchedule from './curriculum-schedule.vue';

const isPersonal = ref(-1);
const currentTab = ref(1);
const adjustInit = ref(false);
const showAddPopup = ref(false);

const positionX = ref<number>(0);
const positionY = ref<number>(0);
let minTop = 0;
let maxTop = 0;
let minLeft = 0;
let maxLeft = 0;
let originClientX = 0;
let originClientY = 0;
let originPositionX = 0;
let originPositionY = 0;
const storageKey = makeStorageKey('CURRICULUM_SCHEDULE_ADD_POSITION');

onBeforeMount(() => {
  const pageParam = getPageParams();
  // 支持教师通讯录查看教师课表
  if (pageParam.locationId && pageParam.userId) {
    isPersonal.value = 1;
  } else {
    const currentUserType = loginStore().currentUserType;
    isPersonal.value = currentUserType === EUserType.teacher ? 0 : 1;
  }

  if (isPersonal.value === 0) {
    uni.$on('ADJUST_APPLY_SUCCESS', handleApplySuccess);

    const systemInfo: any = uni.getSystemInfoSync();
    const width = uni.upx2px(48 * 2);
    const margin = uni.upx2px(16 * 2);
    const saveBottom = systemInfo.safeAreaInsets.bottom || 0;
    const initTop = -width - margin;
    maxTop = Math.floor(uni.upx2px(10 * 2) + saveBottom - 1);
    minTop = Math.ceil(-systemInfo.windowHeight + uni.upx2px(58 * 2) + saveBottom + 1);
    minLeft = 1;
    maxLeft = Math.floor(systemInfo.windowWidth - width - 1);
    const positionRes = uni.getStorageSync(storageKey);
    if (positionRes) {
      positionX.value = positionRes.x;
      positionY.value = positionRes.y;
    } else {
      positionX.value = systemInfo.windowWidth - width - margin;
      positionY.value = initTop;
    }
  }
});

onBeforeUnmount(() => {
  if (isPersonal.value === 0) {
    uni.$off('ADJUST_APPLY_SUCCESS', handleApplySuccess);
  }
});

function handleTabChange(index: number) {
  currentTab.value = index;
  if (index === 2) {
    adjustInit.value = true;
  }
  uni.$emit('CLOSE_ADJUST_APPLY_SEARCH_MORE');
}

function handleApplySuccess() {
  currentTab.value = 2;
  adjustInit.value = true;
}

function handleAdd() {
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-adjust/apply',
  });
  showAddPopup.value = false;
}

function handlePlus() {
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-supply/apply',
  });
  showAddPopup.value = false;
}

const updateStorePosition = debounce(() => {
  uni.setStorageSync(storageKey, {
    x: positionX.value,
    y: positionY.value,
  });
}, 500);

function handleAddTouchStart(e: any) {
  originPositionX = positionX.value || 0;
  originPositionY = positionY.value || 0;
  const tag = e.touches[0];
  originClientX = tag.clientX;
  originClientY = tag.clientY;
}

function handleAddTouchMove(e: any) {
  const tag = e.touches[0];
  let targetX = originPositionX + tag.clientX - originClientX;
  let targetY = originPositionY + tag.clientY - originClientY;
  if (targetX < minLeft) {
    targetX = minLeft;
  } else if (targetX > maxLeft) {
    targetX = maxLeft;
  }
  if (targetY < minTop) {
    targetY = minTop;
  } else if (targetY > maxTop) {
    targetY = maxTop;
  }

  positionX.value = targetX;
  positionY.value = targetY;
  updateStorePosition();
}
</script>

<style lang="scss">
.curriculum-popup-content {
  :deep(.u-drawer-content) {
    border-radius: 16rpx 16rpx 0 0 !important;
    overflow: hidden;
  }
}
.curriculum-tabs-wrapper {
  :deep(.u-scroll-bar) {
    bottom: 0 !important;
  }
  :deep(.u-tabs-item) {
    font-weight: 500 !important;
  }
}
</style>

<style lang="scss" scoped>
.shadow {
  z-index: 2;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.08);
}
.add-button {
  position: absolute;
  top: -128rpx;
  left: calc(100% - 128rpx);
  height: 96rpx;
  width: 96rpx;
  z-index: 5;
  border-radius: 50%;
  background-color: rgba(22, 119, 255, 1);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.16);
}
.add-placeholder {
  height: 104rpx;
  text-align: center;
  line-height: 104rpx;
  font-size: 32rpx;
  color: rgba(134, 144, 156, 1);
}
.add-item {
  height: 108rpx;
  text-align: center;
  line-height: 108rpx;
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.88);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.confirm-btn {
  height: 108rpx;
  text-align: center;
  line-height: 108rpx;
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.88);
}
</style>
