<template>
  <!-- <mt-page title="xxxxx" theme="default" :show-top-gap="false" :show-notice-bar="false"> -->
  <view class="zy-margin">
    <view class="zy-flex zy-flex-row-between">
      <view class="refraction-item zy-shadow" @click="toDetectList('-1')">
        <view class="text-color4">
          <text class="refraction-item--tag tag-green"></text>
          应检人数
        </view>
        <view class="text-size44">
          {{ pageData.screenData.total || 0 }}
        </view>
      </view>
      <view class="refraction-item zy-shadow" @click="toDetectList('1')">
        <view class="text-color4">
          <text class="refraction-item--tag"></text>
          已检测
        </view>
        <view class="text-size44">
          {{ pageData.screenData.checkCount || 0 }}
        </view>
      </view>
      <view class="refraction-item zy-shadow" @click="toDetectList('0')">
        <view class="text-color4">
          <text class="refraction-item--tag tag-orange"></text>
          未检测
        </view>
        <view class="text-size44">
          {{ pageData.screenData.total - pageData.screenData.checkCount || 0 }}
        </view>
      </view>
    </view>
    <view class="refraction-card zy-shadow">
      <view>
        <view class="refraction-scan">
          <image
            class="zy-width-full zy-height-full"
            src="../../../assets/image/scan_bg.png"
            mode="widthFix"
          >
          </image>
        </view>
        <view class="refraction-btn" hover-class="zy-hover" @click="toScan">
          <zy-icons type="scan" :size="48"></zy-icons>
          <text class="zy-margin-left-xs">点击扫码</text>
        </view>
      </view>

      <view
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding zy-border-solid-top"
        hover-class="hover-bg--gray"
        @click="toPage('/app-intelligent-iot/vision-collect/pages/class/index', 'choose')"
      >
        <text class="text-size34">手动选择</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
    </view>
    <view class="refraction-card zy-shadow">
      <view
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding"
        hover-class="hover-bg--gray"
        @click="handleVisionJump"
      >
        <text class="text-size34">设备连接</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
      <view
        v-if="store.getters.classicBluetoothInfo_vc?.isConnect"
        class="zy-flex zy-flex-row-between zy-padding zy-border-solid-top"
      >
        <text>{{ store.getters.classicBluetoothInfo_vc?.name }}</text>
        <text class="text-main-color" @click="handleBleDisConnect">断开连接</text>
      </view>
    </view>
  </view>
  <!-- </mt-page> -->
</template>

<script setup>
import {
  disconnect as bleDisConnect,
  publish,
} from '@/app-intelligent-iot/js-bridge/bleConnectService';
import $http from '@/app-intelligent-iot/vision-collect/api';
import { loginEvent } from '@/app-intelligent-iot/vision-collect/utils/loginEvent';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { computed, reactive } from 'vue';

const { proxy } = getPublicFuncProxy();

const userInfo = loginStore().userInfo;
const store = useStore();
const pageData = reactive({
  screenData: {},
  queryForm: {
    threadId: '',
    labelId: 1,
  },
  isInAndroid: false,
});
// 获取蓝牙连接设备信息
const bluetoothInfo = computed(() => {
  return store.getters.bluetoothInfo_vc;
});

const navigateToEvent = studentInfo => {
  console.log('navigateToEvent::::', studentInfo);
  let url = `/app-intelligent-iot/vision-collect/pages/check/visual-acuity-test/form?studentId=${studentInfo.id}`;
  uni.navigateTo({
    url: url,
  });
};

// 获取筛查数量
const getScreenNum = () => {
  proxy.$publicFunc.showLoading();
  $http.kangRui
    .findScreenNum(pageData.queryForm)
    .then(res => {
      pageData.screenData = res.resultContent;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(() => {
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
      loginEvent(userInfo.tel);
    });
};

// 打开扫码
const toScan = () => {
  // 检测工作已结束
  let status = store.getters.checkWork_vc.chkGoingStatus;
  if (status == '2') {
    proxy.$publicFunc.showToast('none', '检测工作已结束');
    return;
  }
  uni.scanCode({
    scanType: ['qrCode'],
    success: function (res) {
      try {
        let data = {
          threadId: store.getters.checkWork_vc.id,
          cipherStuIdNo: res.result,
        };
        $http.kangRui.findStudentDetail(data).then(res => {
          console.log('res::::::::::::::', res);
          console.log('res::::::::::::::', res.iNFO);
          store.commit('UPDATE_STUINFO_VC', res.iNFO);
          navigateToEvent(res.iNFO);
        });
      } catch (e) {
        console.log('error', e);
        loginEvent(userInfo.tel);
      }
    },
  });
};
// 跳转页面
const toPage = (url, type) => {
  // 检测工作已结束

  let status = store.getters.checkWork_vc.chkGoingStatus;
  if (type == 'choose' && status == '2') {
    proxy.$publicFunc.showToast('none', '检测工作已结束');
    return;
  }
  uni.navigateTo({
    url: url,
  });
};
const toDetectList = status => {
  return;
  // 如果是复测工作或者已检测工作，跳转到检查列表
  // 否则跳转到选择班级页面
  let screenType = store.getters.screenType;
  let index = store.getters.checkWork.screenItem || '0';

  let url = '';
  if (status == 1 || status == 0) {
    url = `/vision-health/pages/check/detect/list?type=${pageData.queryForm.type}&status=${status}&screenType=${screenType}`;
  } else {
    return;
  }
  uni.navigateTo({
    url: url,
  });
  // }
};

/* 断开经典蓝牙 */
const handleBleDisConnect = () => {
  bleDisConnect(store.getters.classicBluetoothInfo_vc.deviceId, () => {
    store.commit('UPDATE_CLASSIC_BLUETOOTH_INFO_VC', {
      isConnect: false,
      deviceId: '',
      name: '',
      type: '',
    });
  });
};
const toPage2 = url => {
  uni.navigateTo({
    url: url,
  });
};
/* 跳转视力设备连接页面 */
const handleVisionJump = () => {
  console.log('isInAndroid=================', pageData.isInAndroid);
  if (pageData.isInAndroid) {
    toPage2('/app-intelligent-iot/vision-collect/pages/check/visual-acuity-test/equipment');
  } else {
    // #ifdef APP-PLUS
    uni.showModal({
      content: 'iOS暂不支持该功能，请使用安卓版麦塔校园APP',
      showCancel: false,
      confirmText: '我知道了',
    });
    // #endif

    // #ifdef MP-WEIXIN
    uni.showModal({
      content: '小程序暂不支持该功能，请使用安卓版麦塔校园APP',
      showCancel: false,
      confirmText: '我知道了',
    });
    // #endif
  }
};
onShow(() => {
  store.commit('UPDATE_DOCTORTYPR', false);

  console.log('🚀退出视力测试是否连接蓝牙', store.getters.classicBluetoothInfo_vc?.isConnect);
  if (store.getters.classicBluetoothInfo_vc?.isConnect) {
    //退出视力测试
    publish(
      store.getters.classicBluetoothInfo.deviceId,
      {
        message: 'CTS_EXIT,200#',
      },
      res => {
        console.log('🚀退出视力测试===========', fff, 'res========', res);
      },
    );
  }

  uni.setStorageSync('VISIONFALG', true);
  getScreenNum();
  uni.onBLEConnectionStateChange(({ connected }) => {
    if (!connected && bluetoothInfo.value) {
      store.commit('UPDATE_BLUEINFO_VC', null);
    }
  });
});
onLoad(option => {
  uni.getSystemInfo({
    success: function (res) {
      // #ifdef APP-PLUS
      if (res.platform === 'android') {
        pageData.isInAndroid = true;
        return;
      }
      // #endif
      pageData.isInAndroid = false;
    },
  });
  pageData.queryForm.threadId = store.getters.checkWork_vc.id;
});

onPullDownRefresh(() => {
  getScreenNum();
});
</script>

<style lang="scss" scoped>
.refraction-item {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  width: 210rpx;
  padding: 20rpx;
  text-align: center;
  font-size: $zy-font-size28;

  &--tag {
    display: inline-block;
    width: 8rpx;
    height: 20rpx;
    background: $zy-main-color;
    border-radius: 12rpx;
    backdrop-filter: blur(20rpx);
  }

  .tag-green {
    background: $zy-spare-color5;
  }

  .tag-orange {
    background: $zy-spare-color6;
  }
}

.refraction-card {
  background: $zy-middle-color2;
  border-radius: 12rpx;
  margin: 24rpx 0;

  .refraction-scan {
    padding: 80rpx 30rpx 0;
    width: 320rpx;
    height: 340rpx;
    margin: 0 auto;
  }

  .refraction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $zy-main-color;
    border-radius: 12rpx;
    color: $zy-middle-color2;
    width: 568rpx;
    height: 96rpx;
    margin: 60rpx auto;
    font-size: $zy-font-size34;
  }
}
</style>
