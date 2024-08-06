import { type IBridgeOptions, type TRejectCallback, type TResolveCallback } from './types';

const widgetRefresh = (
  options: IBridgeOptions,
  resolve: TResolveCallback,
  reject: TRejectCallback,
) => {
  uni.$emit('workbencPullDownRefresh');
  resolve({});
};

export default {
  widgetRefresh,
};
