import { log } from '@/utils/tools';
import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import { supportDevice } from '../hooks/print/utils';

const JCAPI = uni.requireNativePlugin('JCSDK-JCApiModule') as any;

export interface Device {
  name: string;
  address: string;
  rssi: string;
}

export const usePrintDevicesForApp = defineStore('printDevicesForApp', () => {
  // 缓存信息
  const deviceData = ref<Device[]>([]);
  const printDevice = ref<Device>();
  const isLinked = ref(false);
  const blueErrCode = ref();
  const searching = ref(true);

  const setPrintDevice = (value?: Device) => {
    // printDevice.value = value;
    if (!value) {
      isLinked.value = false;
    }
  };

  // 连接打印机
  function handleConnect(item, hideToast?: boolean) {
    if (isLinked.value && item.address === printDevice.value?.address) {
      return Promise.resolve();
    }
    log('handleConnect', item);
    return new Promise((resolve, reject) => {
      if (!hideToast) {
        uni.hideLoading();
        uni.showLoading({
          title: '正在连接中...',
        });
      }

      JCAPI.openPrinterByDevice(
        {
          address: item.address,
          name: item.name,
          deviceType: 0, // 设备类型：0-蓝牙，1-网络
        },
        r => {
          log('handleConnect res', item);
          if (r.code == 0) {
            printDevice.value = item;
            isLinked.value = true;
            resolve(item);
          } else {
            isLinked.value = false;
            uni.showToast({
              icon: 'none',
              title: '打印机连接失败',
            });
            reject();
          }
          uni.hideLoading();
        },
      );
    });
  }

  function checkConnected() {
    return handleConnect(printDevice.value);
  }

  // 搜索打印机
  function handleSearchDevice() {
    searching.value = true;

    if (!deviceData.value.length) {
      uni.hideLoading();
      uni.showLoading({
        title: '搜索打印机中...',
      });
    }

    JCAPI.getBluetoothDevices(printers => {
      log('file: usePrintDevicesForApp.ts:126 ~ handleSearchDevice ~ printers:', printers);
      printers = printers.filter(val => supportDevice.some(v => val.name.includes(v)));
      const _init = isLinked.value && printDevice.value ? [printDevice.value] : [];
      // 过滤重复的
      deviceData.value = printers.reduce((res, item) => {
        if (!res.some(val => val.deviceId === item.deviceId)) {
          res.push(item);
        }
        return res;
      }, _init);

      if (deviceData.value.length && !isLinked.value) {
        log('自动连接第一个', deviceData.value);
        handleConnect(deviceData.value[0]);
      }
      uni.hideLoading();

      uni.stopPullDownRefresh();
      searching.value = false;
    });
  }

  function cancelConnect() {
    JCAPI.close();
    printDevice.value = undefined;
    isLinked.value = false;
  }

  function updateLinkStatus() {
    if (!printDevice.value) {
      isLinked.value = false;
      if (!searching.value) {
        handleSearchDevice();
      }
      return;
    }
    const connected = JCAPI.isConnected();
    log('connDevice', connected);

    isLinked.value = connected.value == 1;
    if (!isLinked.value) {
      handleConnect(printDevice.value, false);
    }
  }

  const checkDeviceAndSearch = () => {
    uni.openBluetoothAdapter({
      success(res) {
        log('success', res);
        updateLinkStatus();
        handleSearchDevice();
      },
      fail(res) {
        blueErrCode.value = res?.errCode;
        log('fail', res);
        uni.hideLoading();
        uni.showToast({
          title: '请检查是否开启蓝牙',
          icon: 'none',
          mask: false,
          duration: 3000,
        });
        uni.stopPullDownRefresh();
      },
    });
  };

  onMounted(() => {
    // 初始化SDK;
    JCAPI.initSDK();
  });

  return {
    deviceData,
    printDevice,
    isLinked,
    blueErrCode,
    searching,
    setPrintDevice,
    cancelConnect,
    handleSearchDevice,
    handleConnect,
    checkConnected,
    checkDeviceAndSearch,
    updateLinkStatus,
  };
});
