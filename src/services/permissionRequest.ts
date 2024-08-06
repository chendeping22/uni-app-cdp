import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';

export type Callback = (...args: any[]) => void;

/** 向android原生申请选择图片所需的权限 */
export const requestAllChooseImagePer = async (success: Callback, fail: Callback) => {
  callBridge({
    service: Service.permission,
    action: Action.requestAllChooseImagePermissions,
  })
    .then(res => {
      success({ data: res });
    })
    .catch(err => {
      fail(err);
    });
};

/** 向android原生申请扫码所需的权限 */
export const requestAllScanCodePer = async (success: Callback, fail: Callback) => {
  callBridge({
    service: Service.permission,
    action: Action.requestScanCodePermissions,
  })
    .then(res => {
      success({ data: res });
    })
    .catch(err => {
      fail(err);
    });
};

/** 向android原生打电话所需的权限 */
export const requestPhoneCallPer = async (success: Callback, fail: Callback) => {
  callBridge({
    service: Service.permission,
    action: Action.requestPhoneCallPermissions,
  })
    .then(res => {
      success({ data: res });
    })
    .catch(err => {
      fail(err);
    });
};
