<template>
  <!-- <mt-page title="xxxxx" theme="default" :show-top-gap="false" :show-notice-bar="false"> -->
  <view class="zy-margin">
    <view v-if="!pageData.queryForm.isDaily" class="zy-flex zy-flex-row-between">
      <view class="refraction-item zy-shadow" @click="toDetectList('-1')">
        <view class="text-color4">
          <text class="refraction-item--tag tag-green"></text>
          应检人数
        </view>
        <view class="text-size44">
          {{ pageData.screenData.totalNum || 0 }}
        </view>
      </view>
      <view class="refraction-item zy-shadow" @click="toDetectList('1')">
        <view class="text-color4">
          <text class="refraction-item--tag"></text>
          已检测
        </view>
        <view class="text-size44">
          {{ pageData.screenData.screenNum || 0 }}
        </view>
      </view>
      <view class="refraction-item zy-shadow" @click="toDetectList('0')">
        <view class="text-color4">
          <text class="refraction-item--tag tag-orange"></text>
          未检测
        </view>
        <view class="text-size44">
          {{ pageData.screenData.unScreenNum || 0 }}
        </view>
      </view>
    </view>
    <view v-if="pageData.queryForm.type !== '-1'" class="refraction-card zy-shadow">
      <!-- #ifdef  MP-WEIXIN -->
      <view class="refraction-scan">
        <image
          class="zy-width-full zy-height-full"
          src="@/app-intelligent-iot/static/image/scan_bg.png"
          mode="widthFix"
        >
        </image>
      </view>
      <view class="refraction-btn" hover-class="zy-hover" @click="toScan">
        <zy-icons type="scan" :size="48"></zy-icons>
        <text class="zy-margin-left-xs">点击扫码</text>
      </view>
      <!-- #endif -->
      <!-- #ifdef APP-VUE || H5 -->
      <view v-if="!pageData.queryForm.isDaily && facePermissions()">
        <view class="refraction-scan">
          <image
            class="zy-width-full zy-height-full"
            src="@/app-intelligent-iot/static/image/face.png"
            mode="widthFix"
          >
          </image>
        </view>
        <view class="refraction-btn" hover-class="zy-hover" @click="openFaceRec">
          <text class="zy-margin-left-xs">人脸识别</text>
        </view>
      </view>
      <view v-else>
        <view class="refraction-scan">
          <image
            class="zy-width-full zy-height-full"
            src="@/app-intelligent-iot/static/image/scan_bg.png"
            mode="widthFix"
          >
          </image>
        </view>
        <view class="refraction-btn" hover-class="zy-hover" @click="toScan">
          <zy-icons type="scan" :size="48"></zy-icons>
          <text class="zy-margin-left-xs">点击扫码</text>
        </view>
      </view>

      <!-- #endif -->
      <view
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding zy-border-solid-top"
        hover-class="hover-bg--gray"
        @click="toPage('/app-intelligent-iot/vision-health/pages/class/index', 'choose')"
      >
        <text class="text-size34">手动选择</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
      <!-- #ifdef APP-VUE || H5 -->
      <view
        v-if="!pageData.queryForm.isDaily && facePermissions()"
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding zy-border-solid-top"
        hover-class="hover-bg--gray"
        @click="toScan"
      >
        <text class="text-size34">扫码识别</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
      <!-- #endif -->
    </view>
    <view v-if="pageData.queryForm.type == '1'" class="refraction-card zy-shadow">
      <view
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding"
        hover-class="hover-bg--gray"
        @click="handRefractionJump"
      >
        <text class="text-size34">设备连接</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
      <view v-if="bluetoothInfo" class="zy-flex zy-flex-row-between zy-padding zy-border-solid-top">
        <text>{{ bluetoothName }}</text>
        <text class="text-main-color" @click="disconnect">断开连接</text>
      </view>
    </view>
    <view v-if="pageData.queryForm.type == '0'" class="refraction-card zy-shadow">
      <view
        class="zy-flex zy-flex-row-between zy-flex-col-center zy-padding"
        hover-class="hover-bg--gray"
        @click="handleVisionJump"
      >
        <text class="text-size34">设备连接</text>
        <zy-icons type="arrow_right" :size="48"></zy-icons>
      </view>
      <view
        v-if="store.getters.classicBluetoothInfo?.isConnect"
        class="zy-flex zy-flex-row-between zy-padding zy-border-solid-top"
      >
        <text>{{ store.getters.classicBluetoothInfo?.name }}</text>
        <text class="text-main-color" @click="handleBleDisConnect">断开连接</text>
      </view>
    </view>
  </view>
  <!-- </mt-page> -->
</template>

<script lang="ts" setup>
import {
  disconnect as bleDisConnect,
  publish,
} from '@/app-intelligent-iot/js-bridge/bleConnectService';
import {
  hideLoading as hideLoading2,
  onFaceRes as onFaceResEvent,
  openFaceDiscern,
  showLoading as showLoading2,
  showToast as showToast2,
} from '@/app-intelligent-iot/js-bridge/face';
import {
  compareBase64,
  studentDetail,
} from '@/app-intelligent-iot/services/home-school-communication';
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import usePermissions from '@/hooks/use-permissions';
import { loginStore } from '@/store/modules/login';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onReady, onShow } from '@dcloudio/uni-app';
import { computed, reactive } from 'vue';
const { proxy } = getPublicFuncProxy();
const userInfo = loginStore().userInfo;

const facePermissions = () => {
  const permission = usePermissions().value.find(item => item.appCode === 'Vision:Screening');
  if (!permission) return false;

  const mobilePermission = permission.childs.find(
    item => item.permissionCode === 'Vision:Screening:Mobile',
  );
  if (!mobilePermission) return false;

  const faceRecognitionPermission = mobilePermission.childs.find(
    item => item.permissionCode === 'Vision:Screening:Mobile:faceRecognition',
  );
  return !!faceRecognitionPermission;
};

const store = useStore();
const pageData = reactive({
  screenData: {},
  queryForm: {
    userId: '',
    workId: '',
    type: '',
    workType: '',
    isDaily: false,
  },
  isInAndroid: false,
});
// 获取蓝牙连接设备信息
const bluetoothInfo = computed(() => {
  return store.getters.bluetoothInfo;
});

const bluetoothName = computed(() => {
  const { bluetoothInfo, checkWork } = store.getters;
  const { deviceSn = '', deviceName = '' } = checkWork || {};
  const deviceSnArr = deviceSn ? deviceSn.split(',') : [];
  const deviceNameArr = deviceName ? deviceName.split(',') : [];
  const bluetoothSn = bluetoothInfo?.name;
  const index = deviceSnArr.findIndex(sn => sn === bluetoothSn);
  return deviceNameArr[index] || bluetoothInfo?.name || '未知蓝牙设备';
});

const onFaceResCall = statu => {
  onFaceResEvent(statu, () => {});
};
const showToast = tip => {
  showToast2(tip, () => {});
};
const hideLoading = () => {
  hideLoading2(null, () => {});
};
const showLoading = () => {
  showLoading2('校验中', () => {});
};
const navigateToEvent = studentInfo => {
  let type = store.getters.checkType;
  let url;
  switch (Number(type)) {
    case 0: //视力
      url = `/app-intelligent-iot/vision-health/pages/check/visual-acuity-test/form?studentId=${studentInfo.id}`;
      break;
    case 1: //屈光
      url = `/app-intelligent-iot/vision-health/pages/check/refraction/form?studentId=${studentInfo.id}`;
      break;
    default:
      url = `/app-intelligent-iot/vision-health/pages/check/other/form?studentId=${studentInfo.id}`;
  }
  uni.navigateTo({
    url: url,
  });
};
const openFaceRec = () => {
  // if (!pageData.isInAndroid) {
  //   // #ifdef APP-PLUS
  //   uni.showModal({
  //     content: 'iOS暂不支持该功能，请使用安卓版麦塔校园APP',
  //     showCancel: false,
  //     confirmText: '我知道了',
  //   });
  //   // #endif
  //   return;
  // }

  openFaceDiscern(null, res => {
    showLoading();
    const parms = {
      imgBase64: res.data,
    };
    compareBase64(parms)
      .then(res => {
        if (!res) {
          hideLoading();
          showToast('未检测到学生信息');
          onFaceResCall(false);
        } else {
          store.commit('UPDATE_STUINFO', res);
          hideLoading();
          showToast('人脸识别成功');
          setTimeout(() => {
            onFaceResCall(true);
            navigateToEvent(res);
          }, 1000);
        }
      })
      .catch(() => {
        hideLoading();
      });
  });
};
// 获取筛查数量
const getScreenNum = () => {
  // 日常检测不需要请求筛查数量
  if (pageData.queryForm.isDaily) return;
  proxy.$publicFunc.showLoading();
  $http.check
    .getScreenNum(pageData.queryForm)
    .then(res => {
      pageData.screenData = res;
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    })
    .catch(() => {
      proxy.$publicFunc.hideLoading();
      uni.stopPullDownRefresh();
    });
};

// 打开扫码
const toScan = () => {
  // 检测工作已结束
  let status = store.getters.checkWork?.status;
  if (status == '2') {
    proxy.$publicFunc.showToast('none', '检测工作已结束');
    return;
  }
  uni.scanCode({
    scanType: ['qrCode'],
    success: function (res) {
      try {
        const studentInfo = JSON.parse(
          res.result.replace(/([\'\"]?id[\'\"]?\:)(\d+)/gi, '$1' + '"$2"'),
        );
        studentDetail(studentInfo.id).then(res => {
          store.commit('UPDATE_STUINFO', res.baseInfoResp);
        });
        navigateToEvent(studentInfo);
      } catch (e) {
        proxy.$publicFunc.showToast('none', '该二维码无法被解析');
      }
    },
  });
};
// 跳转页面
const toPage = (url, type) => {
  // 日常检测
  if (pageData.queryForm.isDaily) {
    uni.navigateTo({
      url: url,
    });
    return;
  }

  // 检测工作已结束
  let status = store.getters.checkWork?.status;
  if (type == 'choose' && status == '2') {
    proxy.$publicFunc.showToast('none', '检测工作已结束');
    return;
  }
  // 如果是复测工作，直接跳转到复测学生列表
  let index = store.getters.checkWork.screenItem || '0';
  if (type == 'choose' && index == '1') {
    url = '/app-intelligent-iot/vision-health/pages/class/student';
  }
  //lish 增加条件type == 'choose'为手动选择点击进入
  let screenType = store.getters.screenType;
  if (type == 'choose' && screenType == '2') {
    url = '/app-intelligent-iot/vision-health/pages/class/student';
  }
  uni.navigateTo({
    url: url,
  });
};
const toPage2 = url => {
  uni.navigateTo({
    url: url,
  });
};
const toDetectList = status => {
  // 如果是复测工作或者已检测工作，跳转到检查列表
  // 否则跳转到选择班级页面
  let screenType = store.getters.screenType;
  let index = store.getters.checkWork.screenItem || '0';
  // if (type == 0 || type == 1) {
  //只有视力和屈光才可以
  let url = `/app-intelligent-iot/vision-health/pages/check/detect/list?type=${pageData.queryForm.type}&status=${status}&screenType=${screenType}`;

  if (index != '1' && status != '1') {
    url = `/app-intelligent-iot/vision-health/pages/class/index?type=${pageData.queryForm.type}&status=${status}&screenType=${screenType}`;
  }
  if (screenType == '2') {
    url = `/app-intelligent-iot/vision-health/pages/check/detect/list?type=${pageData.queryForm.type}&status=${status}&screenType=${screenType}`;
  }
  uni.navigateTo({
    url: url,
  });
  // }
};
// 断开设备连接
const disconnect = () => {
  uni.showModal({
    title: '提示',
    content: '确认断开设备连接?',
    success: res => {
      if (res.confirm) {
        uni.closeBLEConnection({
          deviceId: bluetoothInfo.value.deviceId,
          success() {
            store.commit('UPDATE_BLUEINFO', null);
          },
        });
      }
    },
  });
};
/* 断开经典蓝牙 */
const handleBleDisConnect = () => {
  bleDisConnect(store.getters.classicBluetoothInfo.deviceId, () => {
    store.commit('UPDATE_CLASSIC_BLUETOOTH_INFO', {
      isConnect: false,
      deviceId: '',
      name: '',
      type: '',
    });
  });
};

/* 跳转视力设备连接页面 */
const handleVisionJump = () => {
  if (pageData.isInAndroid) {
    // #ifdef MP-WEIXIN
    uni.showModal({
      content: '小程序暂不支持该功能，请使用安卓版麦塔校园APP',
      showCancel: false,
      confirmText: '我知道了',
    });
    // #endif
    toPage2('/app-intelligent-iot/vision-health/pages/check/visual-acuity-test/equipment');
    return;
  } else {
    // #ifdef APP-PLUS
    uni.showModal({
      content: 'iOS暂不支持该功能，请使用安卓版麦塔校园APP',
      showCancel: false,
      confirmText: '我知道了',
    });
    // #endif
  }
};
/* 跳转屈光设备连接页面 */
const handRefractionJump = () => {
  console.log(
    '🚀 ~ file: index.vue:398 ~ handRefractionJump ~ pageData.isInAndroid:',
    pageData.isInAndroid,
  );

  /**ios小程序不开放设备连接 */
  // #ifdef MP-WEIXIN
  if (!pageData.isInAndroid) {
    uni.showModal({
      content: 'iOS暂不支持该功能，请使用安卓版麦塔校园APP',
      showCancel: false,
      confirmText: '我知道了',
    });
    return;
  }
  // #endif
  toPage2('/app-intelligent-iot/vision-health/pages/check/equipment');
};
onShow(() => {
  console.log(
    '🚀 ~ file: index.vue:411 ~ onShow ~ pageData.queryForm.type:',
    pageData.queryForm.type,
  );

  if (pageData.queryForm.type == 0) {
    store.commit('UPDATE_DOCTORTYPR_AWS', false);

    console.log('🚀退出视力测试是否连接蓝牙', store.getters.classicBluetoothInfo?.isConnect);
    if (store.getters.classicBluetoothInfo?.isConnect) {
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
  }

  uni.setStorageSync('VISIONFALG', true);
  getScreenNum();
  uni.onBLEConnectionStateChange(({ connected }) => {
    if (!connected && bluetoothInfo.value) {
      store.commit('UPDATE_BLUEINFO', null);
    }
  });
});
onLoad(option => {
  uni.getSystemInfo({
    success: function (res) {
      if (res.platform === 'android') {
        pageData.isInAndroid = true;
      } else {
        pageData.isInAndroid = false;
      }
    },
  });

  pageData.queryForm.type = option.type;
  pageData.queryForm.workId = store.getters.checkWork?.id;
  pageData.queryForm.userId = userInfo.id;
  pageData.queryForm.workType = store.getters.checkWork?.screenItem || '0';
  // 是否是日常检测
  pageData.queryForm.isDaily = store.getters.isDaily;
});
onReady(() => {
  const isDaily = store.getters.isDaily;
  const title = isDaily ? '日常检测' : `${store.getters.checkName}筛查`;
  uni.setNavigationBarTitle({
    title,
  });
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
