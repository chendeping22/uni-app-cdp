import type { IWidget, IWidgetConfig } from '@/store/modules/workbench';
import { isNil } from '@/utils/lodash-es';

// 小组件
export const widgetMarginTop = 24; //小组件距离上个组件的高度
export const widgetHeaderHeight = 106; //小组件头部高度
export const defaultHeight = 446; // 没权限高度

export const getWidgetConfig = (temp: IWidget): IWidgetConfig => {
  return !isNil(temp.config)
    ? (JSON.parse(temp.config) as IWidgetConfig)
    : { widget: '', w: 1, h: 0 };
};

export const getBodyHeight = (config: IWidgetConfig) => {
  if (isNil(config.h)) {
    return 0;
  }
  return config.h - widgetMarginTop - widgetHeaderHeight;
};
