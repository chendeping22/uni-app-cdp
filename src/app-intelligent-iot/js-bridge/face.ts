import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';

export type Callback = (...args: any[]) => void;

/**
 * 打开人脸识别
 * @param callBack {Callback}请求回调
 */
export const openFaceDiscern = (id: string, callback: Callback) => {
  callBridge({
    service: Service.face,
    action: Action.openFaceDiscern,
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
export const onFaceRes = (statu: boolean, callback: Callback) => {
  callBridge({
    service: Service.face,
    action: Action.onFaceRes,
    data: statu,
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 * 关闭人脸识别
 * @param callBack {Callback}请求回调
 */
export const closeFaceDiscern = (id: string, callback: Callback) => {
  callBridge({
    service: Service.face,
    action: Action.closeFaceDiscern,
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 * 弹出提示
 * @param callBack {Callback}请求回调
 */
export const showToast = (msg: string, callback: Callback) => {
  callBridge({
    service: Service.system,
    action: Action.showToast,
    data: { msg },
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 * 开启loading
 * @param callBack {Callback}请求回调
 */
export const showLoading = (msg: string, callback: Callback) => {
  callBridge({
    service: Service.system,
    action: Action.showLoading,
    data: { msg },
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
/**
 *  关闭loading
 * @param callBack {Callback}请求回调
 */
export const hideLoading = (id: string, callback: Callback) => {
  callBridge({
    service: Service.system,
    action: Action.hideLoading,
  })
    .then(res => {
      callback({ data: res });
    })
    .catch(err => {
      callback(err);
    });
};
