import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePrint } from '../hooks/print/usePrint';
import { supportDevice } from '../hooks/print/utils';

export interface Device {
  name: string;
  deviceId: string;
}

export const usePrintDevices = defineStore('printDevices', () => {
  const { scanedPrinters, getConnName, openPrinter, closePrinter } = usePrint();
  // 缓存信息
  const deviceData = ref<Device[]>([]);
  const printDevice = ref<Device>();
  const blueErrCode = ref();
  const searching = ref(true);
  const isLinked = ref(false);

  const setPrintDevice = (value?: Device) => {
    // printDevice.value = value;
    if (!value) {
      isLinked.value = false;
    }
  };

  // 连接打印机
  function handleConnect(item, hideToast?: boolean) {
    if (isLinked.value && item.deviceId === printDevice.value?.deviceId) {
      return Promise.resolve();
    }
    console.log('handleConnect', item);
    return new Promise((resolve, reject) => {
      if (!hideToast) {
        uni.hideLoading();
        uni.showLoading({
          title: '正在连接中...',
        });
      }
      openPrinter(
        item.name,
        () => {
          console.log('handleConnect 连接上', item);
          printDevice.value = item;
          isLinked.value = true;
          uni.hideLoading();
          resolve(item);
        },
        () => {
          uni.hideLoading();
          isLinked.value = false;
          uni.showToast({
            icon: 'none',
            title: '打印机连接失败',
          });
          reject();
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

    scanedPrinters(printers => {
      printers = printers.filter(val => supportDevice.some(v => val.name.includes(v)));
      // 过滤重复的
      deviceData.value = printers.reduce((res, item) => {
        if (!res.some(val => val.deviceId === item.deviceId)) {
          res.push(item);
        }
        return res;
      }, []);

      if (deviceData.value.length && !isLinked.value) {
        console.log('自动连接第一个', deviceData.value);
        handleConnect(deviceData.value[0]);
      }

      uni.stopPullDownRefresh();

      uni.hideLoading();
      searching.value = false;
    });
  }

  function cancelConnect() {
    closePrinter();
    printDevice.value = undefined;
    isLinked.value = false;
    // handleSearchDevice();
  }

  function updateLinkStatus() {
    const connDevice = getConnName();
    if (connDevice) {
      printDevice.value = connDevice;
      isLinked.value = true;
    } else if (printDevice.value) {
      handleConnect(printDevice.value, false);
    } else {
      isLinked.value = false;
      if (!searching.value) {
        handleSearchDevice();
      }
    }

    console.log(
      'file: usePrintDevices.ts:83 ~ updateLinkStatus ~ connDevice:',
      connDevice,
      isLinked.value,
    );
  }

  const checkDeviceAndSearch = () => {
    uni.openBluetoothAdapter({
      success(res) {
        console.log('success', res);
        updateLinkStatus();
        handleSearchDevice();
      },
      fail(res) {
        blueErrCode.value = res?.errCode;
        uni.hideLoading();
        uni.showToast({
          title: '请检查是否开启蓝牙',
          icon: 'none',
          mask: false,
          duration: 3000,
        });
        console.log('fail', res);
        uni.stopPullDownRefresh();
      },
    });
  };

  // onMounted(() => {
  //   checkDeviceAndSearch();
  // });

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
