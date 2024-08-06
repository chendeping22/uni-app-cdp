<template>
  <view>
    <view class="zy-tips"> 注: 连接设备时请检查手机蓝牙功能是否开启 </view>
    <view v-if="bleList && bleList.length" class="zy-margin">
      <view
        v-for="(item, index) in bleList"
        :key="index"
        class="item-card zy-flex zy-flex-row-between zy-flex-col-center"
        @click="hanleBleConnect(item.address)"
      >
        <view class="">
          <view class="zy-margin-bottom-xs">
            {{ item.name || '未知蓝牙设备' }}
          </view>
          <view class="text-color5 text-size24"> 设备编号: {{ item.address }} </view>
        </view>

        <view class="">
          <text v-if="item.status == '1'" class="text-main-color">已连接</text>
          <image
            v-else-if="item.status == '2'"
            class="loading-animation"
            src="../../../assets/image/icon_loading.png"
            mode="widthFix"
          ></image>
          <text v-else-if="item.status == '3'" class="text-color5">未连接</text>
        </view>
      </view>
    </view>
    <zy-empty v-else></zy-empty>
  </view>
</template>

<script setup>
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onUnload } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';

import { connect, search } from '@/app-intelligent-iot/js-bridge/bleConnectService';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { uniqBy } from '@/utils/lodash-es';

const { proxy } = getPublicFuncProxy();

const store = useStore();

const { commit } = store;
const pageData = reactive({
  pageList: [],
});
const timer = ref(false);
const time1 = ref(false);

const bleInfo = computed(() => {
  return store.getters.classicBluetoothInfo_vc;
});

const bleList = computed(() => {
  return uniqBy(pageData.pageList, 'address');
});

const hanleBleConnect = id => {
  if (bleInfo.value?.isConnect) {
    proxy.$publicFunc.showToast('none', '已有连接中的设备,请断开连接中的设备后重试');
    return;
  }
  proxy.$publicFunc.showLoading('设备连接中');
  const target = pageData.pageList.find(item => item.address == id);
  target.status = 2;
  let data;
  if (target.name === 'kaxVision') {
    data = {
      id,
      uuid: 'fa87c0d0-afac-11de-8a39-0800200c9a66',
    };
  } else {
    data = {
      id,
    };
  }

  connect(data, res => {
    console.log('🚀 ~ file: equipment.vue:82 ~ hanleBleConnect ~ res:', res);
    if (res.data === 'STC_GT,0#') {
      console.log('🚀🚀🚀🚀🚀🚀🚀 不是该模式');
      return;
    }

    if (res.code == '0') {
      commit('UPDATE_CLASSIC_BLUETOOTH_INFO_VC', {
        isConnect: true,
        deviceId: id,
        name: target.name,
        type: res.data,
      });
      target.status = 1;
      proxy.$publicFunc.hideLoading();
      proxy.$publicFunc.showToast('none', '设备连接成功', 2000);
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    } else {
      /* 蓝牙链接信息置空 */
      commit('UPDATE_CLASSIC_BLUETOOTH_INFO_VC', {
        isConnect: false,
        deviceId: '',
        name: '',
        type: '',
      });
      target.status = 3;
      proxy.$publicFunc.hideLoading();
      proxy.$publicFunc.showToast('none', res.msg);
    }
  });
  time1.value = setTimeout(() => {
    proxy.$publicFunc.hideLoading();
    proxy.$publicFunc.showToast('none', '连接超时，请重试');
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  }, 1000 * 60);
};

const handleRefresh = () => {
  pageData.pageList = [];
  /* 首个计时，给15s，15s后无响应则断定为无设备 */
  timer.value = setTimeout(() => {
    uni.stopPullDownRefresh();
  }, 15 * 1000);
  if (bleInfo.value?.isConnect) {
    pageData.pageList.push({
      name: bleInfo.value.name,
      address: bleInfo.value.deviceId,
      status: 1,
    });
  }
  search(res => {
    const item = res.data;
    if (
      bleInfo.value?.deviceId !== item.address &&
      !pageData.pageList.includes(single => item.address == single.address)
    )
      pageData.pageList.push({
        ...item,
        status: 3,
      });
    if (timer.value) {
      clearTimeout(timer.value);
    }
    timer.value = setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 5000);
  });
};

/* 首次进入 */
onLoad(() => {
  uni.startPullDownRefresh();
});
/* 下拉刷新 */
onPullDownRefresh(() => {
  handleRefresh();
});
onUnload(() => {
  clearTimeout(time1.value);
});
</script>

<style lang="scss" scoped>
.loading-animation {
  width: 48rpx;
  height: 48rpx;
  animation: goround 1s linear infinite;
}

@keyframes goround {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(90deg);
  }

  50% {
    transform: rotate(180deg);
  }

  75% {
    transform: rotate(270deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
