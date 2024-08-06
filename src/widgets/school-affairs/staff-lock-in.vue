<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pullDownRefresh="handleOnMount"
  >
    <u-empty-custom v-if="data.clockFlag === 0" card text="未配置考勤组" />
    <template v-else>
      <view class="container">
        <view>
          <view v-if="data.restFlag" class="flex lock-rest">
            <u-icon name="clock" size="32" color="#8C8C8C"></u-icon>
            <text>今日休息</text>
          </view>
          <scroll-view
            v-if="data.clockItems.length > 0"
            class="lock-top"
            scroll-x="true"
            @touchmove.stop="stopScrollView"
          >
            <view class="lock-top-con">
              <view v-for="(item, index) in data.clockItems" :key="index" class="top-card">
                <view class="card-header">
                  <text class="card-time">{{
                    `${item.type === 1 ? '上班' : '下班'}${item.time}`
                  }}</text>
                  <text
                    v-if="item.status === 3 && !item.clockTime && isClock"
                    class="card-control"
                    @click="handleClickUpdate(item.type, item.id)"
                    >{{ `更新打卡` }}</text
                  >
                </view>
                <view class="card-bottom">
                  <u-icon
                    v-if="item.clockTime"
                    name="checkmark-circle-fill"
                    color="#52c41a"
                    size="26"
                    style="margin-right: 10rpx"
                  />
                  <text class="color-placeholder">{{
                    `${
                      item.clockTime ? dayjs(item.clockTime).format('HH:mm') : ''
                    } ${getClockStatusText(item.status, item.clockTime)}`
                  }}</text>
                  <text v-if="item.status === 1" class="err-tag">{{ `迟到` }}</text>
                  <text v-if="item.status === 2" class="err-tag">{{ `早退` }}</text>
                  <text v-if="item.status === 3" class="err-tag">{{ `缺勤` }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="lock-container">
          <view class="lock-details">
            <view class="lock-details-box">
              <view
                :class="`lock-bg lock-bg-${isClock ? 'normal' : 'disabled'}`"
                @click="handleClickClock"
              >
                <view class="lock-time-container">
                  <view class="font-17 normal-text">{{
                    `${isClock ? (data.clockType === 1 ? '上班' : '下班') : '无法'}打卡`
                  }}</view>
                  <view class="font-15 normal-text">{{ currentTime }}</view>
                </view>
              </view>
              <view v-if="data.clockFlag === 1" class="lock-tips">
                <u-icon
                  name="info-circle-fill"
                  color="#ff4d4f"
                  size="34"
                  style="margin-right: 10rpx"
                />
                <text>管理员未设置手机打卡，请使用考勤机</text>
              </view>
              <template v-else>
                <view
                  v-if="isClock && (lockType === 1 || lockType === 3) && isAddressClock"
                  class="lock-tips"
                >
                  <u-icon
                    name="checkmark-circle-fill"
                    color="#52c41a"
                    size="34"
                    style="margin-right: 10rpx"
                  />
                  <text>{{ `已进入考勤范围: ${allowAddressInfo.addrName}` }}</text>
                </view>
                <view v-if="!isClock && (lockType === 1 || lockType === 3)" class="lock-tips">
                  <u-icon
                    name="info-circle-fill"
                    color="#ff4d4f"
                    size="34"
                    style="margin-right: 10rpx"
                  />
                  <text>{{ addressErrorInfo }}</text>
                </view>
                <view
                  v-if="isClock && (lockType === 2 || lockType === 3) && isWifiClock"
                  class="lock-tips"
                >
                  <u-icon
                    name="checkmark-circle-fill"
                    color="#52c41a"
                    size="34"
                    style="margin-right: 10rpx"
                  />
                  <text>{{ `已连接考勤Wi-Fi: ${allowWifiInfo.name}` }}</text>
                </view>
                <view v-if="!isClock && (lockType === 2 || lockType === 3)" class="lock-tips">
                  <u-icon
                    name="info-circle-fill"
                    color="#ff4d4f"
                    size="34"
                    style="margin-right: 10rpx"
                  />
                  <text>检查[位置]权限已开启，</text>
                  <text>或连接至考勤指定Wi-Fi</text>
                  <text class="wifi-lock" @click="showWiFiInfo">查看</text>
                </view>
              </template>
            </view>
          </view>
        </view>
      </view>
    </template>
  </widget-card>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, reactive, ref } from 'vue';

import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import type { ClockRulesData } from '@/services/widgets';
import {
  AppClockParams,
  ClockWayInfo,
  ClockWays,
  fetchAppClock,
  fetchAppUpdateClock,
  fetchClockRulesInfoApi,
  fetchWorkFlowId,
} from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { log, showInfo } from '@/utils/tools';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';

const data = ref<ClockRulesData>({
  clockFlag: -1,
  clockItems: [],
  restFlag: 0,
  serviceTime: 0,
  clockType: 1,
  ways: [],
});

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
withDefaults(defineProps<IProps>(), {});
const isClock = ref(false); //是否处于可以打卡的状态;

const isLoad = ref(false);
const currentTime = ref('');
let lockByAddress: ClockWayInfo[] = reactive([]); // 可打卡的地址信息
let lockByWifi: ClockWayInfo[] = reactive([]); // 可打卡的wifi信息
const isAddressClock = ref(false);
const isWifiClock = ref(false);
const lockType = ref(0); // 0 未配置  1 地址  2wifi  3地址和wifi
const addressErrorInfo = ref('超出管理员指定的打卡范围');
let allowAddressInfo: ClockWayInfo = reactive({
  addr: '',
  addrName: '',
  lat: '',
  lng: '',
  range: '',
  name: '',
  mac: '',
});
let allowWifiInfo: ClockWayInfo = reactive({
  addr: '',
  addrName: '',
  lat: '',
  lng: '',
  range: '',
  name: '',
  mac: '',
});
const reSinningFlowId = ref('');

let timerFlag = false;
/** 调用API，获取真实数据 */
async function fetchData() {
  const res = await fetchClockRulesInfoApi();
  return res || {};
}

async function handleOnMount() {
  let res = await fetchData();
  data.value = res;
  isLoad.value = true;
  // 获取打卡地址类型
  getLockType(res.ways);
  // 初始化判断是否处于可打卡的范围;
  isAllowLockIn();
}

const stopScrollView = (event: any) => {
  event.stopPropagation();
  event.preventDefault();
};
// 获取打卡地址类型
function getLockType(lockWayArr: ClockWays[]) {
  lockByAddress = [];
  lockByWifi = [];
  if (lockWayArr.length) {
    lockWayArr.forEach(item => {
      if (item.type === 1) {
        lockByAddress.push(item.info);
      } else {
        lockByWifi.push(item.info);
      }
    });

    if (lockByAddress.length > 0 && lockByWifi.length > 0) {
      lockType.value = 3;
    } else if (lockByAddress.length > 0) {
      lockType.value = 1;
    } else {
      lockType.value = 2;
    }
  }
}
// 判断是否处于可打卡的范围;
async function isAllowLockIn() {
  // wifi 打卡逻辑
  if (lockByWifi.length > 0) {
    isWifiClock.value = await isLockByWifi(lockByWifi);
  }
  console.log('isWifi', isWifiClock.value);
  // 地点打卡逻辑
  if (lockByAddress.length > 0) {
    isAddressClock.value = await isLockByAddress(lockByAddress);
  }
  console.log('isAddress', isAddressClock.value);
  // 地址和wifi考勤判断是否可打卡, 一个满足则可打卡, 优先wifi
  isClock.value = isWifiClock.value || isAddressClock.value;
  return isClock.value;
}
// 根据地址判断是否处于可打卡范围内;
async function isLockByAddress(infoArr: ClockWayInfo[]) {
  // 获取当前的位置信息
  try {
    const { latitude, longitude }: any = await getLocation();
    log(`..... latitude: ${latitude}, longitude: ${longitude}`);
    //获取不到定位信息
    if (!latitude && !longitude) {
      log('获取不到地位信息');
      addressErrorInfo.value = '无法获取当前定位，请检查权限是否开启';
      // todo: 获取不到地位信息描述
      return false;
    } else {
      console.log('latitude&longitude', latitude, longitude);
      // 当数组为长度大于0时说明有符合打卡的要求
      const allowLockInfo = infoArr.find((item: ClockWayInfo) => {
        const distance = getDistance({
          posLat: latitude,
          posLng: longitude,
          targetLat: Number(item.lat),
          targetLng: Number(item.lng),
        });
        console.log('distance range', item.range);
        // 测试过程，对错值转换
        return Number(item.range) > distance * 1000;
      });
      console.log('allowAddressLock', allowLockInfo);
      if (allowLockInfo) {
        allowAddressInfo = allowLockInfo;
        return true;
      } else {
        return false;
      }
    }
  } catch (err) {
    log('获取不到地址信息');
    addressErrorInfo.value = '无法获取当前定位，请检查权限是否开启';
    return false;
  }
}

async function isLockByWifi(infoArr: ClockWayInfo[]) {
  try {
    const posWifiInfo: any = await callBridge({
      service: Service.wifi,
      action: Action.getConnectedWifi,
    });
    console.log('posWifiInfo', posWifiInfo);
    if (posWifiInfo.ssid && posWifiInfo.bssid) {
      const lockWifiInfo = infoArr.find(
        item => item.mac.toLowerCase() === posWifiInfo.bssid.toLowerCase(),
      );
      console.log('allowWifiInfo', lockWifiInfo);
      if (lockWifiInfo) {
        allowWifiInfo = lockWifiInfo;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log('获取wifi信息失败');
    return false;
  }
}
function showWiFiInfo() {
  const wifiNameArr: string[] = [];
  lockByWifi.forEach(item => {
    wifiNameArr.push(item.name);
  });
  const wifiNameString = wifiNameArr.join(',');

  uni.showModal({
    title: '考勤指定Wi-Fi信息',
    content: wifiNameString,
    confirmText: '知道了',
  });
}
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0'); // 补零
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
};

const getClockStatusText = (status: number, timer: string) => {
  let statusText = '';
  if (status === -1 || status === 3) {
    statusText = timer ? '已打卡' : '未打卡';
  } else if (status === 4) {
    statusText = '已请假';
  } else {
    statusText = '已打卡';
  }
  return statusText;
};

const updateTimeTimer = ref<any>();
onBeforeMount(() => {
  updateTime();
  updateTimeTimer.value = setInterval(updateTime, 1000);
});

let timer: any = null;
let timerCount = 0;
function loopUpdate() {
  clearInterval(timer);
  if (timerCount <= 4) {
    handleOnMount();
    timerCount++;
    timer = setInterval(() => {
      loopUpdate();
    }, 2000);
  }
}
onMounted(() => {
  handleOnMount();
  fetchWorkFlowId('kqbq').catch(res => {
    if (res.id) {
      reSinningFlowId.value = res.id;
    }
  });
});
onBeforeUnmount(() => {
  // 清楚计时器
  clearInterval(updateTimeTimer.value);
});
onUnmounted(() => {
  clearInterval(timer);
});
// 跳转到考勤app的考勤页面
const handleClickNavigator = () => {
  uni.navigateTo({
    url: `/app-school-affairs/staff-attendance/home/index?pageId=attendance`,
  });
};
const handleClickUpdate = (type: number, id: number) => {
  const modalContent = `是否确认将${
    type === 1 ? '上班' : '下班'
  }打卡时间由【未打卡】更新为当前时间`;

  uni.showModal({
    content: modalContent,
    confirmText: '确定',
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {
        handleClickUpdateConfirm(id);
      }
    },
  });
};
// 更新打卡时间接口
const handleClickUpdateConfirm = (id: number) => {
  const params = {
    id: id,
    clockTime: new Date().getTime(),
  };

  fetchAppUpdateClock(params).finally(() => {
    showInfo('更新打卡成功！');
    timerCount = 0;
    loopUpdate();
  });
};

// 获取两个点之间的距离
function getDistance({ posLng, posLat, targetLng, targetLat }: any) {
  var La1 = (posLat * Math.PI) / 180.0;
  var La2 = (targetLat * Math.PI) / 180.0;
  var La3 = La1 - La2;
  var Lb3 = (posLng * Math.PI) / 180.0 - (targetLng * Math.PI) / 180.0;
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(La3 / 2), 2) +
          Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2),
      ),
    );
  s = s * 6378.137; //地球半径
  s = Math.round(s * 10000) / 10000;
  console.log('get distance', s, ...arguments);
  return s;
}
const authorizeLocation = async () =>
  new Promise<void>((resolve, reject) => {
    uni.authorize({
      scope: 'scope.userLocation',
      success() {
        console.log('获取定位权限成功');
        resolve();
      },
      fail(e: any) {
        console.log('获取定位权限失败:', e);
        reject(e);
      },
    });
  });

// const getLocation = async () => {
//   return {
//     latitude: 24.524243,
//     longitude: 118.157669,
//   };
// };

const getLocation = async () => {
  // #ifdef MP-WEIXIN
  console.log('...... 申请定位权限 start');
  await authorizeLocation();
  console.log('...... 申请定位权限 success');
  // #endif
  return new Promise((resolved, rejected) => {
    uni.getLocation({
      type: 'gcj02',
      success: function (res: any) {
        resolved(res);
      },
      fail: (err: any) => {
        console.log('error getLocation', err);
        // uni.showModal({
        //   title: '温馨提示',
        //   content: '您已拒绝定位,请开启',
        //   confirmText: '去设置',
        //   success(res) {
        //     if (res.confirm) {
        //       //打开授权设置
        //       openSetting();
        //     }
        //   },
        // });
        rejected(err);
      },
    });
  });
};
const openSetting = () => {
  // 打开小程序的设置
  // #ifdef MP-WEIXIN
  uni.openSetting();
  // #endif

  // App跳转系统的设置界面
  // #ifdef APP-PLUS
  uni.getSystemInfo({
    success(res) {
      if (res.platform == 'ios') {
        //IOS
        plus.runtime.openURL('app-settings://');
      }
    },
  });
  // #endif
};
const handleClickClock = async () => {
  if (timerFlag) return;
  const isAllow = await isAllowLockIn();
  console.log('isAllow', isAllow);
  if (isClock.value && isAllow) {
    timerFlag = true;
    // 获取是否可以打卡信息
    fetchClickAppClock({
      clockWay: isAddressClock.value ? 1 : 2,
      clockTime: new Date().getTime(),
      clockAddr: isAddressClock.value && !isWifiClock.value ? JSON.stringify(allowAddressInfo) : '', //优先wifi打卡，当且仅当支持地址打卡时，使用地址打卡
      clockWifi: isWifiClock.value ? JSON.stringify(allowWifiInfo) : '',
    });
  }
};
// 打卡
async function fetchClickAppClock(params: AppClockParams) {
  fetchAppClock(params)
    .then(() => {
      showInfo('打卡成功！');
      timerFlag = false;
      timerCount = 0;
      loopUpdate();
    })
    .catch(() => {
      showInfo('打卡失败，请刷新页面后再试');
    });
}
</script>

<style lang="scss" scoped>
.extend-info {
  margin-top: 70rpx;
}

.flex {
  display: flex;
  align-items: center;
}

.w100 {
  width: 100%;
}

.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.font-xxt {
  font-size: 40rpx;
}

.color-base {
  color: #1d2129;
}

.font-secondary {
  font-size: 0.75rem;
}

.no-bold {
  font-weight: 400;
}

.color-secondary {
  color: #4e5969;
}

.font-content {
  font-size: 24rpx;
}

.font-xt {
  font-size: 34rpx;
}

.flex-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.top-card {
  width: 300rpx;
  flex-shrink: 0;
  padding: 16rpx;
  background-color: #fafafa;
  border-radius: 8rpx;
  margin-right: 24rpx;
}
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.lock-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lock-top {
  height: 130rpx;
  overscroll-behavior: none;
}
.lock-top-con {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.lock-rest {
  padding-bottom: 10rpx;
  justify-content: center;
}
.card-time {
  color: #333;
  font-size: 30rpx;
}
.card-control {
  color: #1667ff;
  font-size: 26rpx;
}
.wifi-lock {
  color: #1667ff;
  font-size: 30rpx;
  margin-left: 10rpx;
}
.location-lock {
  color: #1667ff;
  font-size: 30rpx;
}
.color-placeholder {
  color: #86909c;
  font-size: 24rpx;
}
.err-tag {
  padding: 6rpx 10rpx;
  font-size: 22rpx;
  color: #ff4d4f;
  background: #fff1f0;
  border-radius: 8rpx;
  margin-left: 10rpx;
}
.card-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16rpx;
}
.card-bottom {
  display: flex;
}
.lock-bg {
  display: flex;
  width: 256rpx;
  height: 256rpx;
  border-radius: 128rpx;
  margin: 0 auto 40rpx;
  align-items: center;
  justify-content: center;
}
.lock-bg-normal {
  background: radial-gradient(80.9% 80.9% at 39.06% 22.27%, #ffffff66 0%, #00000066 100%), #1677ff;
  background-blend-mode: overlay, normal;
  filter: drop-shadow(0 4px 8px #00000029);
}
.lock-bg-disabled {
  background: radial-gradient(80.9% 80.9% at 39.06% 22.27%, #ffffff66 0%, #00000066 100%), #00000026;
  background-blend-mode: overlay, normal;
}
.lock-details {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 0;
  flex-wrap: wrap;
  margin-top: 24rpx;
}
.lock-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  flex-wrap: wrap;
}
.normal-text {
  text-align: center;
  color: #fff;
}
.font-15 {
  font-size: 30rpx;
}
.font-17 {
  font-size: 34rpx;
}
</style>
