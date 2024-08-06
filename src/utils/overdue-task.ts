/**
 * 延时执行任务
 * 多任务时目前只支持执行相同任务, 目前仅用于ajax的showLoading与关闭
 */

import { hideLoading, showLoading } from './tools';

const SingleTon = (() => {
  const tasks: string[] = [];
  let timeHandle: any = null;
  let isHide = true; // 增加个状态 hideLoading与showLoading是配套使用的, 直接调用会有异常
  return {
    addTask: (key: string, timeout = 1000) => {
      clearTimeout(timeHandle);
      isHide = true;
      timeHandle = setTimeout(() => {
        if (tasks.length > 0) {
          isHide = false;
          showLoading();
        }
      }, timeout);
      tasks.push(key);
    },
    removeTask: (key: string) => {
      tasks.splice(
        tasks.findIndex(t => t === key),
        1,
      );

      // #ifdef APP-PLUS || H5
      // isHide app端不知为啥处理isHide有问题, 故为0就直接关闭
      if (tasks.length === 0) {
        clearTimeout(timeHandle);
        hideLoading();
      }
      // #endif

      // #ifdef MP-WEIXIN
      if (tasks.length === 0 && !isHide) {
        clearTimeout(timeHandle);
        hideLoading();
      }
      // #endif
    },
    clear: () => {
      tasks.splice(0, tasks.length);
    },
  };
})();

export const OverdueTask = (() => {
  return {
    addTask: (key: string, timeout = 1000) => {
      SingleTon.addTask(key, timeout);
    },
    removeTask: (key: string) => {
      SingleTon.removeTask(key);
    },
    clear: () => {
      SingleTon.clear();
    },
  };
})();
