import { loginStore } from '@/store/modules/login';
import { Server_Asset_Prefix } from '@/utils/constant';
import { EUserIdentityType, createSharePath } from '@/utils/handle-share-link';
import { IGetClockInDetailRtn } from '../services/clock-in';

type IShare = Pick<IGetClockInDetailRtn, 'id' | 'personName' | 'title'>;

export const shareClockInTask = (task: IShare) => {
  const userInfo = loginStore().userInfo;

  const params = `locationId=${userInfo?.locationId}&taskId=${task.id}&timestamp=${Date.now()}`;
  const path = `/app-preprimary-education/clock-in/guardian/detail/index?${params}`;
  const appCode = 'clockin';
  const encodePath = createSharePath(path, appCode, EUserIdentityType.guardian);
  return {
    title: `${task.personName}老师创建的打卡任务#${task.title}`,
    path: encodePath,
    imageUrl: `${Server_Asset_Prefix}img_transmit.jpg`,
  };
};
