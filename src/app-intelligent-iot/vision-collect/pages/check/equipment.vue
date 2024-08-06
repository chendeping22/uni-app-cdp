<template>
  <!-- <mt-page :show-notice-bar="false" bg-type="default" title="设备连接"> -->
  <view class="">
    <view class="zy-tips"> 注: 连接设备时请检查手机蓝牙功能是否开启 </view>
    <view v-if="pageData.pageList && pageData.pageList.length" class="zy-margin">
      <view
        v-for="(item, index) in pageData.pageList"
        :key="index"
        class="item-card zy-flex zy-flex-row-between zy-flex-col-center"
        @click="connectionBluetooth(item)"
      >
        <view class="">
          <view class="zy-margin-bottom-xs">
            {{ item.name || '未知蓝牙设备' }}
          </view>
          <view class="text-color5 text-size24"> 设备编号: {{ item.deviceId }} </view>
        </view>
        <view class="">
          <text v-if="item.status == '1'" class="text-main-color">已连接</text>
          <image
            v-else-if="item.status == '2'"
            class="loading-animation"
            src="../../assets/image/icon_loading.png"
            mode="widthFix"
          ></image>
          <text v-else class="text-color5" style="white-space: nowrap">未连接</text>
        </view>
      </view>
    </view>
    <zy-empty v-else></zy-empty>
  </view>
  <!-- </mt-page> -->
</template>

<script setup>
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { useStore } from '@/store/old';
import { onLoad, onPullDownRefresh, onUnload } from '@dcloudio/uni-app';
import { computed, reactive } from 'vue';
const { proxy } = getPublicFuncProxy();
const store = useStore();
const pageData = reactive({
  pageList: [],
  timer: null,
});
// 获取蓝牙连接设备信息
const bluetoothInfo = computed(() => {
  return store.getters.bluetoothInfo;
});
// 关闭蓝牙设备搜索
const stopBluetoothDevicesDiscovery = () => {
  uni.stopBluetoothDevicesDiscovery({
    success(res) {
      console.log(res, 'stopBluetoothDevicesDiscovery');
    },
  });
};
// 蓝牙搜索
const getBluetoothList = () => {
  // 初始化蓝牙模块
  console.log('🚀 初始化蓝牙模块***********************************');
  uni.openBluetoothAdapter({
    success(res) {
      // 过滤蓝牙设备搜索
      const servicesArr = [
        /* '0000180A-0000-1000-8000-00805F9B34FB',
        '0000FFF0-0000-1000-8000-00805F9B34FB', //1
        '0000FFE0-0000-1000-8000-00805F9B34FB', // 旧设备+巨目验光仪
        '00001800-0000-1000-8000-00805F9B34FB', //2
        '00001801-0000-1000-8000-00805F9B34FB', //3
        '000018F0-0000-1000-8000-00805F9B34FB', // FA-100K 新缘验光仪2
        'E7810A71-73AE-499D-8C15-FAA9AEF0C3F2', // FA-100K 新缘验光仪1
        '0003CDD0-0000-1000-8000-00805F9B0131', // RMK800A 雄博验光仪 */
        //'0003CDD0-0000-1000-8000-00805F9B0131',
        //'00001801-0000-1000-8000-00805F9B34FB', // RMK800A 雄博验光仪
        //'00001800-0000-1000-8000-00805F9B34FB', // RMK800A 雄博验光仪
      ];
      uni.startBluetoothDevicesDiscovery({
        services: servicesArr,
        success(res) {
          uni.stopPullDownRefresh();
          proxy.$publicFunc.showLoading('设备搜索中');
          uni.onBluetoothDeviceFound(function (el) {
            if (
              el.devices[0].name.indexOf('RMK-800A') === -1 &&
              //el.devices[0].name.indexOf('FA-100K') === -1 &&
              el.devices[0].advertisServiceUUIDs.indexOf('E7810A71-73AE-499D-8C15-FAA9AEF0C3F2') ===
                -1 && //新缘1
              el.devices[0].advertisServiceUUIDs.indexOf('000018F0-0000-1000-8000-00805F9B34FB') ===
                -1 && //新缘2
              el.devices[0].advertisServiceUUIDs.indexOf('0000FFE0-0000-1000-8000-00805F9B34FB') ===
                -1 && //巨目
              el.devices[0].advertisServiceUUIDs.indexOf('0000FFF0-0000-1000-8000-00805F9B34FB') ===
                -1 && //1
              el.devices[0].advertisServiceUUIDs.indexOf('00001800-0000-1000-8000-00805F9B34FB') ===
                -1 && //2
              el.devices[0].advertisServiceUUIDs.indexOf('00001801-0000-1000-8000-00805F9B34FB') ===
                -1 //3
            ) {
              return;
            }

            let index = pageData.pageList.findIndex(i => i.deviceId == el.devices[0].deviceId);
            if (index == -1) {
              //-1表示当前搜索到的设备（el）不在已找到的设备列表（pageData.pageList）中,避免添加重复设备
              if (bluetoothInfo.value && el.devices[0].deviceId == bluetoothInfo.value.deviceId) {
                el.devices[0].status = '1';
              }
              pageData.pageList.push(el.devices[0]);
            } else {
              // 修复ios首次获取设备name为空的问题
              pageData.pageList.splice(index, 1, el.devices[0]);
            }
            if (pageData.pageList.length == 1) {
              proxy.$publicFunc.hideLoading();
            }
          });
          pageData.timer = setTimeout(() => {
            if (!pageData.pageList || pageData.pageList.length === 0) {
              proxy.$publicFunc.hideLoading();
              proxy.$publicFunc.showToast(
                'none',
                '搜索超时，请检查蓝牙是否开启，部分安卓机型需开启定位功能',
                5000,
              );
            }
            // 关闭搜索
            stopBluetoothDevicesDiscovery();
          }, 30000);
        },
        fail(err) {
          proxy.$publicFunc.hideLoading();
          uni.stopPullDownRefresh();
          console.log(err, 'err-startBluetoothDevicesDiscovery');
        },
      });
    },
    fail(err) {
      if (err.errCode === 10001) {
        proxy.$publicFunc.showToast('none', '当前蓝牙适配器不可用，请确保您已打开蓝牙');
      } else {
        proxy.$publicFunc.showToast('none', err.errMsg);
      }
      uni.stopPullDownRefresh();
      console.log(err, 'err-openBluetoothAdapter');
    },
  });
};

const getBLEDeviceCharacteristics580 = (services, deviceData) => {
  for (var i = 0; i < services.length; i++) {
    let item = services[i];
    if (['0000FFF0-0000-1000-8000-00805F9B34FB'].includes(item.uuid)) {
      const serviceId = item.uuid;
      uni.getBLEDeviceCharacteristics({
        deviceId: deviceData.deviceId,
        serviceId,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            let deviceItem = res.characteristics[i];
            if (deviceItem.uuid == '0000FFF6-0000-1000-8000-00805F9B34FB') {
              let data = {
                deviceId: deviceData.deviceId,
                serviceId: serviceId,
                characteristicId: deviceItem.uuid,
                read: deviceItem.properties.read,
                write: deviceItem.properties.write,
                notify: deviceItem.properties.notify,
                indicate: deviceItem.properties.indicate,
              };
              proxy.$publicFunc.hideLoading();
              deviceData.status = '1';
              store.commit('UPDATE_BLUEINFO', deviceData);
              store.commit('UPDATE_DEVICE_SERVE', data);
              uni.navigateBack();
              return;
            } else {
              console.log('非蓝牙通知服务');
            }
          }
        },
        fail: res => {
          console.log('fail', res);
        },
      });
      return;
    }
  }

  // 连接的蓝牙没有相关设备服务
  proxy.$publicFunc.showToast('none', '获取设备服务失败，请检查设备是否连接正确');
  deviceData.status = '0';
  uni.closeBLEConnection({
    deviceId: deviceData.deviceId,
    success(res) {
      store.commit('UPDATE_BLUEINFO', null);
    },
  });
};

// 获取蓝牙设备服务列表中的某个服务中所有特征值
const getBLEDeviceCharacteristics = (services, deviceData) => {
  for (var i = 0; i < services.length; i++) {
    let item = services[i];
    if (
      [
        '0000FFE0-0000-1000-8000-00805F9B34FB',
        '49535343-FE7D-4AE5-8FA9-9FAFD205E455',
        '0003CDD0-0000-1000-8000-00805F9B0131', //雄博
      ].includes(item.uuid)
    ) {
      const serviceId = item.uuid;
      uni.getBLEDeviceCharacteristics({
        deviceId: deviceData.deviceId,
        serviceId,
        success: function (res) {
          for (var i = 0; i < res.characteristics.length; i++) {
            let deviceItem = res.characteristics[i];
            if (
              //deviceItem.uuid == '0000FFE1-0000-1000-8000-00805F9B34FB' ||
              //deviceItem.uuid == '49535343-8841-43F4-A8D4-ECBE34729BB3' ||
              //deviceItem.uuid == '0003CDD1-0000-1000-8000-00805F9B0131' || //雄博
              //deviceItem.uuid == '0003CDD2-0000-1000-8000-00805F9B0131' || //雄博
              deviceItem.properties.notify //notify为真值表示该服务是通知服务
            ) {
              // || res.characteristics[i].uuid == '49535343-8841-43F4-A8D4-ECBE34729BB3'
              let data = {
                deviceId: deviceData.deviceId,
                serviceId: serviceId,
                characteristicId: deviceItem.uuid,
                read: deviceItem.properties.read,
                write: deviceItem.properties.write,
                notify: deviceItem.properties.notify,
                indicate: deviceItem.properties.indicate,
              };
              proxy.$publicFunc.hideLoading();
              deviceData.status = '1';
              store.commit('UPDATE_BLUEINFO', deviceData);
              store.commit('UPDATE_DEVICE_SERVE', data);
              uni.navigateBack();
              return;
            } else {
              console.log('非蓝牙通知服务');
            }
          }
        },
        fail: res => {
          console.log('fail', res);
        },
      });
      return;
    }
  }

  // 连接的蓝牙没有相关设备服务
  proxy.$publicFunc.showToast('none', '获取设备服务失败，请检查设备是否连接正确');
  deviceData.status = '0';
  uni.closeBLEConnection({
    deviceId: deviceData.deviceId,
    success(res) {
      console.log(res, '断开蓝牙连接--closeBLEConnection');
      store.commit('UPDATE_BLUEINFO', null);
    },
  });
};

// 蓝牙连接
const connectionBluetooth = data => {
  console.log('🚀 ~ file: equipment.vue:269 ~ connectionBluetooth ~ data:', data);
  if (data.status == '1') {
    proxy.$publicFunc.showToast('none', '蓝牙已连接');
    return;
  }
  // https://confluence.leedarson.com/pages/viewpage.action?pageId=71219128
  // 屈光项目进行设备连接时，去掉授权限制
  // const checkWork = store.getters.checkWork;
  // if (checkWork) {
  // 	let deviceFlag = false;
  // 	if (checkWork.deviceSn) {
  // 		checkWork.deviceSn.split(',').forEach(sn => {
  // 			if (sn == data.name) {
  // 				deviceFlag = true;
  // 			}
  // 		})
  // 	}
  // 	if (!deviceFlag) {
  // 		proxy.$publicFunc.showToast('none', '请为该设备授权');
  // 		return;
  // 	}
  // }
  data.status = '2';
  proxy.$publicFunc.showLoading('蓝牙连接中');
  uni.createBLEConnection({
    deviceId: data.deviceId,
    timeout: 10000, // 10s连接超时
    success: res => {
      console.log('🚀 ~ file: equipment.vue:296 ~ connectionBluetooth ~ res:', res);
      proxy.$publicFunc.hideLoading();
      proxy.$publicFunc.showToast('none', '设备连接成功');
      // 需延时连接，不然会报错
      proxy.$publicFunc.showLoading('获取设备服务中');
      setTimeout(function () {
        uni.getBLEDeviceServices({
          deviceId: data.deviceId,
          success: res => {
            const services = res.services.filter((item, i) => {
              return !/^000018/.test(item.uuid);
            });
            if (data.name === 'BT580') {
              getBLEDeviceCharacteristics580(services, data);
            } else {
              getBLEDeviceCharacteristics(services, data);
            }
          },
          fail: err => {
            console.log('获取服务失败', err);
            proxy.$publicFunc.hideLoading();
            proxy.$publicFunc.showToast('none', '获取设备服务失败');
            data.status = '0';
          },
        });
      }, 1000);
    },
    fail: err => {
      console.log('连接失败---', JSON.stringify(err));
      proxy.$publicFunc.hideLoading();
      proxy.$publicFunc.showToast('none', '设备连接失败');
      data.status = '0';
    },
  });
};

onLoad(() => {
  console.log('🚀  bluetoothInfo.value***************************', bluetoothInfo.value);

  if (bluetoothInfo.value) {
    uni.getBluetoothDevices({
      success(res) {
        res.devices.forEach(item => {
          if (
            item.name.indexOf('RMK-800A') === -1 &&
            //el.devices[0].name.indexOf('FA-100K') === -1 &&
            item.advertisServiceUUIDs.indexOf('E7810A71-73AE-499D-8C15-FAA9AEF0C3F2') === -1 && //新缘1
            item.advertisServiceUUIDs.indexOf('000018F0-0000-1000-8000-00805F9B34FB') === -1 && //新缘2
            item.advertisServiceUUIDs.indexOf('0000FFE0-0000-1000-8000-00805F9B34FB') === -1 && //巨目
            item.advertisServiceUUIDs.indexOf('0000FFF0-0000-1000-8000-00805F9B34FB') === -1 && //1
            item.advertisServiceUUIDs.indexOf('00001800-0000-1000-8000-00805F9B34FB') === -1 && //2
            item.advertisServiceUUIDs.indexOf('00001801-0000-1000-8000-00805F9B34FB') === -1 //3
          ) {
            return;
          }
          let index = pageData.pageList.findIndex(i => i.deviceId == item.deviceId);
          if (index == -1) {
            if (item.deviceId == bluetoothInfo.value.deviceId) {
              item.status = '1';
            }
            pageData.pageList.push(item);
          }
        });
      },
    });
  } else {
    let platform = uni.getSystemInfoSync().platform;
    if (platform == 'ios') {
      console.log('我是iOS');
      getBluetoothList();
    } else if (platform == 'android') {
      console.log('我是安卓');
      uni.closeBluetoothAdapter({
        success: function (res) {
          pageData.pageList = [];
          getBluetoothList();
        },
      });
    }
  }
});
onPullDownRefresh(() => {
  console.log('***********onPullDownRefresh');
  clearTimeout(pageData.timer);

  let platform = uni.getSystemInfoSync().platform;
  if (platform == 'ios') {
    console.log('我是iOS');
    store.commit('UPDATE_BLUEINFO', null);
    store.commit('UPDATE_DEVICE_SERVE', null);
    pageData.pageList = [];
    getBluetoothList();
  } else if (platform == 'android') {
    console.log('我是安卓');
    uni.closeBluetoothAdapter({
      success: function (res) {
        store.commit('UPDATE_BLUEINFO', null);
        store.commit('UPDATE_DEVICE_SERVE', null);
        pageData.pageList = [];
        getBluetoothList();
      },
      fail: err => {
        console.log('🚀 ~ file: equipment.vue:402 ~ onPullDownRefresh ~ err:', err);
      },
    });
  }
});
onUnload(() => {
  clearTimeout(pageData.timer);
  stopBluetoothDevicesDiscovery();
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
