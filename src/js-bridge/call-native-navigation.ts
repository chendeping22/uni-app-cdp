import type { IBridgeOptions, TRejectCallback, TResolveCallback } from './types';

const back = (options: IBridgeOptions, resolve: TResolveCallback, reject: TRejectCallback) => {
  resolve(options.data);
};

const setRightButtons = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  if (!options.data && !options.data.buttons) {
    const error = {
      code: 400,
      msg: '设置失败',
    };
    reject(error);
    return;
  }

  const currentWebview = getCurrentPage();
  options.data.buttons.forEach((element: any, index: number) => {
    currentWebview?.setTitleNViewButtonStyle(index, element);
  });
  resolve({});
};

const getCurrentPage = () => {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  const currentWebview = page.$getAppWebview ? page.$getAppWebview() : null;
  return currentWebview;
};

export default {
  back,
  setRightButtons,
};
