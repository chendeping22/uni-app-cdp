import { log } from '@/utils/tools';
import { onShow } from '@dcloudio/uni-app';
import { ref, unref } from 'vue';

interface IUpdaterRes {
  hasUpdate: boolean;
  version?: number | string;
}

/**
 * 注：
 * 微信开发者工具上可以通过「编译模式」下的「下次编译模拟更新」开关来调试
 * 小程序开发版/体验版没有「版本」概念，所以无法在开发版/体验版上测试更版本更新情况
 */
export default function useWxUpdater() {
  const weixin = ref(false);

  function updater() {
    const updateManager = uni.getUpdateManager();

    updateManager.onCheckForUpdate((res?: IUpdaterRes) => {
      log('weixin更新信息.....', res);
      if (res?.hasUpdate) {
        updateManager.onUpdateReady(() => updateManager.applyUpdate());
        updateManager.onUpdateFailed(() => {
          uni.showModal({
            title: '已经有新版本了哟',
            content: '新版本更新失败，请您删除当前小程序，重新搜索打开哟',
          });
        });
      }
    });
  }

  // onLaunch
  onShow(() => {
    // #ifdef MP-WEIXIN
    weixin.value = true;
    // #endif

    if (weixin.value) {
      updater();
    }
  });

  return {
    weixin: unref(weixin),
  };
}
