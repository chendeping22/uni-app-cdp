import { requestAllScanCodePer } from '@/services/permissionRequest';
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { ScanCodeType } from '@/utils/scan';
import { showInfo } from '@/utils/tools';
import { isNil } from 'lodash-es';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum ScanTypeEnum {
  /** 首页扫码 */
  ScanHome = 1,
  /** 资产扫码*/
  ScanAsset = 2,
  /** 扫码盘点 */
  ScanInventory = 3,
  /** 资产详情-扫码盘点 */
  AssetsDetailInventory = 4,
}

export const scanInfoStore = defineStore('scanInfoStore', () => {
  const scanRes = ref<Record<string, any>>({});
  const scanInventoryRes = ref<Record<string, any>>({});
  const assetsDetailInventoryRes = ref<Record<string, any>>({});

  const setScanRes = (data?: Record<string, any>) => {
    if (!isNil(data?.type)) {
      switch (data?.type) {
        case ScanTypeEnum.ScanInventory:
          scanInventoryRes.value = data || {};
          break;
        case ScanTypeEnum.AssetsDetailInventory:
          assetsDetailInventoryRes.value = data || {};
          break;
        default:
          break;
      }
      return;
    }
    scanRes.value = data || {};
  };

  return {
    scanRes,
    scanInventoryRes,
    assetsDetailInventoryRes,
    setScanRes,
  };
});

const handleScanInfo = (res?: Record<string, any>, type?: number) => {
  const { setScanRes } = scanInfoStore();
  setScanRes({ ...res, type });
};

export const scanCodeMap: Record<number, any> = {
  [ScanTypeEnum.ScanHome](res: Record<string, any>) {
    const { bizId } = res;
    goToWebView(
      ETargetType.TargetTypeNative,
      `/app-general-affairs-logistics/assets-manage/pages/detail/index?id=${bizId}`,
    );
  },
  [ScanTypeEnum.ScanAsset](res: Record<string, any>) {
    // 资产领用
    handleScanInfo(res);
  },
  [ScanTypeEnum.ScanInventory](res: Record<string, any>) {
    // 资产盘点
    handleScanInfo(res, ScanTypeEnum.ScanInventory);
  },
  [ScanTypeEnum.AssetsDetailInventory](res: Record<string, any>) {
    // 资产详情盘点
    handleScanInfo(res, ScanTypeEnum.AssetsDetailInventory);
  },
};

export const handleScan = async (type: number) => {
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllScanCodePer(
      res => {
        // 已有权限
        console.log('permissionRequestResult : ' + JSON.stringify(res));
        scanHandle(type);
      },
      err => {
        // 无权限
        console.log('permissionRequestFail : ' + JSON.stringify(err));
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    scanHandle(type);
  }
};

export const scanHandle = (type: number) => {
  uni.scanCode({
    scanType: ['qrCode'],
    success: function (res) {
      if (res.result) {
        qrCodeJump(res.result, type);
      } else {
        showInfo('无效的二维码！');
      }
    },
  });
};

export const qrCodeJump = (res: string, type: number) => {
  const msg = '资产标签不正确！';
  if (typeof res !== 'string') {
    showInfo(msg);
    return;
  }
  console.log('🚀🚀🚀🚀🚀🚀🚀 ~ qrCodeJump ~ data:' + res);
  const result: Record<string, any> | string = res?.includes('{') ? JSON.parse(res) : res;
  if (!result || typeof result !== 'object') {
    showInfo(msg);
    return;
  }
  if (!(result?.code && result?.code?.toLowerCase() === ScanCodeType.Assets)) {
    showInfo(msg);
    return;
  }
  return scanCodeMap[type](result);
};
