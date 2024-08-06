/**
 * 获取消息推送cid的方法
 */

import { OverdueTask } from '@/utils/overdue-task';
import { delay } from '@/utils/tools';

/** 把getClientInfoAsync转为同步方式 */
const fetchClientInfo = () => {
  const clientInfo = plus.push.getClientInfo();
  console.log('=======clientInfo=======', clientInfo);
  return Promise.resolve(clientInfo);
};

export const getPushCid = async () => {
  const clientInfo = {} as PlusPushClientInfo;

  // OverdueTask用来控制加载圈的显示与隐藏
  const overdueTaskKey = `${new Date().getTime()}_getClientInfoAsync`;
  OverdueTask.addTask(overdueTaskKey);

  // 尝试10次, 再获取不到就是网络问题了
  for (let i = 0; i < 10; i++) {
    const temp = await fetchClientInfo();
    if (temp.clientid) {
      Object.assign(clientInfo, temp);
      break;
    }
    await delay(200);
  }

  OverdueTask.removeTask(overdueTaskKey);

  return Promise.resolve(clientInfo);
};
