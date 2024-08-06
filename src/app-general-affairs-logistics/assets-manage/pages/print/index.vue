<script setup lang="ts">
import { getAssetPrintTemplate } from '@/app-general-affairs-logistics/services/assets-manage';
import { debounce } from '@/utils/lodash-es';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, reactive, watch } from 'vue';
import LabelItem from '../../components/LabelItem.vue';
import { usePrintAssets } from '../../store/usePrintAssets';

// #ifdef APP-PLUS
import { usePrintDevicesForApp } from '../../store/usePrintDevicesForApp';
// #endif

// #ifndef APP-PLUS
import { usePrintDevices } from '../../store/usePrintDevices';
// #endif

import { log } from '@/utils/tools';
import { Asset } from '../../types/asset';
import { Label } from '../../types/label';
import PrintButtonApp from './print-button-app.vue';
import PrintButton from './print-button.vue';

const FULL_MAX = 3;

const printAssetsStore = usePrintAssets();

let printDevicesStore;

// #ifdef APP-PLUS
printDevicesStore = usePrintDevicesForApp();
// #endif

// #ifndef APP-PLUS
printDevicesStore = usePrintDevices();
// #endif

const state = reactive<{
  list: Asset[];
  current: number;
  _current: number;
  currentInput: number;
  _currentInput: number;
  density: number;
  labelTemplate: Label | null;
  isNext: boolean;
}>({
  list: [],
  current: 0,
  _current: 0,
  currentInput: 1,
  _currentInput: 1,
  isNext: false,
  density: 12,
  labelTemplate: null,
});

const isFullSwiper = computed(() => state.list.length < FULL_MAX);

const assets = computed(() => {
  if (isFullSwiper.value) {
    return [];
  }
  if (state._current === 1) {
    return [
      state.list[state.current - 1] || state.list[state.list.length - 1],
      state.list[state.current],
      state.list[state.current + 1] || state.list[0],
    ];
  }
  if (state._current === 2) {
    return [
      state.list[state.current - 2] || state.list[state.current - 1]
        ? state.list[state.list.length - 2]
        : state.list[state.list.length - 1],
      state.list[state.current - 1] || state.list[state.list.length - 1],
      state.list[state.current],
    ];
  }
  return [
    state.list[state.current],
    state.list[state.current + 1] || state.list[0],
    state.list[state.current + 2] || state.list[state.current + 1] ? state.list[1] : state.list[0],
  ];
});

const disabled = computed(() => {
  return !(printDevicesStore.isLinked && state.list.length);
});

watch(
  () => state.current,
  newVal => {
    if (state.currentInput - 1 !== newVal) {
      state.currentInput = newVal + 1;
      state._currentInput = newVal + 1;
    }
  },
);

watch(
  () => state.currentInput,
  newVal => {
    console.log('file: index.vue:132 ~ newVal:', newVal);
    if (isFullSwiper.value) {
      state._current = state.currentInput - 1;
      return;
    }
    if (state.current + 1 !== newVal) {
      const _new = newVal - 1;
      state.isNext = _new > state.current;
      state.current = newVal - 1;
    }
  },
);

const getTemplate = async () => {
  try {
    const res: any = await getAssetPrintTemplate();
    if (res?.template) {
      let _temp: any = {};
      try {
        _temp = JSON.parse(res?.template);
      } catch (error) {
        _temp = {};
      }

      log('模版', _temp);
      state.labelTemplate = _temp;
    }
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '获取标签模版数据失败',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  }
};

const transition = res => {
  state.isNext = res.detail.dx > 0;
};

const maxSwiperIndex = computed(() => {
  return state.list.length > FULL_MAX ? 2 : state.list.length - 1;
});

const linkedTips = computed(() => {
  if (!printDevicesStore.printDevice) {
    return '未连接';
  }
  return printDevicesStore.isLinked ? '已连接' : '已断开';
});

const onPrev = debounce(() => {
  state.isNext = false;
  state._current = state._current ? state._current - 1 : maxSwiperIndex.value;
}, 200);

const onNext = debounce(() => {
  state.isNext = true;
  state._current = state._current === maxSwiperIndex.value ? 0 : state._current + 1;
}, 200);

const change = e => {
  if (state.isNext) {
    state.current = state.current >= state.list.length - 1 ? 0 : state.current + 1;
  } else {
    state.current = state.current ? state.current - 1 : state.list.length - 1;
  }
  state._current = e.detail.current;
};

const changeFull = e => {
  state.current = e.detail.current;
  state._current = e.detail.current;
};

const handleDevice = () => {
  uni.navigateTo({
    url: '/app-general-affairs-logistics/assets-manage/pages/print/device',
  });
};

const handleBlur = () => {
  if (!state._currentInput) {
    state._currentInput = state.currentInput;
    return;
  }

  if (state._currentInput < 1) {
    state.currentInput = 1;
    state._currentInput = 1;
    return;
  }

  if (state._currentInput > state.list.length) {
    state.currentInput = state.list.length;
    state._currentInput = state.list.length;
    return;
  }

  state.currentInput = state._currentInput;
};

// const changeDensity = (e: any) => {
//   state.density = e.value;
// };

onLoad(() => {
  getTemplate();
  state.list = printAssetsStore.list;
  log('file: index.vue:221 ~ onLoad ~ onLoad:');
});

onShow(() => {
  log('file: index.vue:228 ~ onShow ~ onShow:', printDevicesStore.printDevice);
  if (printDevicesStore.printDevice) {
    // 更新打印机状态
    printDevicesStore.updateLinkStatus();
  } else {
    printDevicesStore.checkDeviceAndSearch();
  }
});
</script>

<template>
  <page custom-overflow="visible">
    <view class="print-page">
      <view class="print-page-content">
        <view class="cell-wrap" @click="handleDevice">
          <u-cell-item
            title="打印机"
            :label="
              printDevicesStore.printDevice ? printDevicesStore.printDevice.name : '无设备连接'
            "
            :border-bottom="false"
            :value-style="{
              paddingLeft: '8rpx',
              paddingRight: '4rpx',
              lineHeight: '32rpx',
              color: printDevicesStore.isLinked ? '#909399' : '#FF4D4F',
            }"
            :label-style="{
              marginTop: '0px',
            }"
          >
            <template #right-icon>
              <view class="print-link">
                <view :style="{ color: printDevicesStore.isLinked ? '#909399' : '#FF4D4F' }">{{
                  linkedTips
                }}</view>
                <view :style="{ color: '#909399' }">{{
                  printDevicesStore.isLinked ? '' : ' , 请重新连接'
                }}</view>
              </view>
            </template>
          </u-cell-item>
        </view>

        <view v-if="state.labelTemplate && state.list.length" class="cell-wrap">
          <view class="cell-wrap-title">打印预览</view>
          <view class="print-preview">
            <swiper
              v-if="isFullSwiper"
              class="print-preview-swiper"
              :style="{ height: `${state.labelTemplate.height * 10}rpx` }"
              circular
              :indicator-dots="false"
              :autoplay="false"
              :current="state._current"
              @change="changeFull"
            >
              <swiper-item v-for="item in state.list" :key="item.assetId || item.id">
                <label-item :data="state.labelTemplate" :asset="item"></label-item>
              </swiper-item>
            </swiper>
            <swiper
              v-else
              class="print-preview-swiper"
              circular
              :style="{ height: `${state.labelTemplate.height * 10}rpx` }"
              :indicator-dots="false"
              :autoplay="false"
              :current="state._current"
              @change="change"
              @transition="transition"
            >
              <swiper-item>
                <label-item :data="state.labelTemplate" :asset="assets[0]"></label-item>
              </swiper-item>
              <swiper-item>
                <label-item :data="state.labelTemplate" :asset="assets[1]"></label-item>
              </swiper-item>
              <swiper-item>
                <label-item :data="state.labelTemplate" :asset="assets[2]"></label-item>
              </swiper-item>
            </swiper>

            <view class="print-preview-number">
              <view class="print-preview-arrow" @click="onPrev">
                <u-icon name="arrow-left" color="#808080" size="36"></u-icon
              ></view>
              <view class="print-preview-input">
                <u-input
                  v-model="state._currentInput"
                  type="number"
                  input-align="center"
                  placeholder=""
                  :height="48"
                  :border="true"
                  @blur="handleBlur"
                />
              </view>
              <text class="print-preview-total"> / {{ state.list.length }}</text>
              <view class="print-preview-arrow" @click="onNext">
                <u-icon name="arrow-right" color="#808080" size="36"></u-icon
              ></view>
            </view>
          </view>
        </view>

        <!-- <view class="cell-wrap">
          <u-cell-item title="打印浓度" :border-bottom="false" :arrow="false">
            <template #right-icon>
              <u-number-box
                v-model="state.density"
                :min="1"
                :max="15"
                @change="changeDensity"
              ></u-number-box>
            </template>
          </u-cell-item>
        </view> -->
      </view>
      <!--  #ifdef APP-PLUS -->
      <print-button-app
        v-if="state.labelTemplate"
        :disabled="disabled"
        :template="state.labelTemplate"
        :isLinked="printDevicesStore.isLinked"
        :list="state.list"
        :darkness="state.density"
        :checkConnected="printDevicesStore.checkConnected"
        :reset-print-data="printAssetsStore.resetSelectedPrint"
        :set-print-device="printDevicesStore.setPrintDevice"
      ></print-button-app>
      <!-- #endif -->
      <!--  #ifndef APP-PLUS -->
      <print-button
        v-if="state.labelTemplate"
        :disabled="disabled"
        :list="state.list"
        :isLinked="printDevicesStore.isLinked"
        :template="state.labelTemplate"
        :darkness="state.density"
        :checkConnected="printDevicesStore.checkConnected"
        :reset-print-data="printAssetsStore.resetSelectedPrint"
        :set-print-device="printDevicesStore.setPrintDevice"
      ></print-button>
      <!-- #endif -->
    </view>
  </page>
</template>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.print-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  &-content {
    flex: 1;
  }
}

.cell-wrap {
  margin: 24rpx 32rpx;
  background-color: $colorWhite;
  box-shadow: $boxShadow;
  border-radius: 16rpx;
  &-title {
    padding: 26rpx 32rpx;
  }
  :deep(.u-cell-hover) {
    background-color: $colorWhite;
  }
}

.print-link {
  display: flex;
  align-items: center;
}
.print-preview {
  padding: 0 32rpx 40rpx;
  &-swiper {
    // height: 368rpx;
  }
  &-number {
    display: flex;
    margin-top: 24rpx;
    align-items: center;
    justify-content: center;
  }
  &-arrow {
    padding: 0 24rpx;
  }
  &-input {
    width: 120rpx;
  }
  &-total {
    line-height: 48rpx;
    padding-left: 16rpx;
  }
}
</style>
