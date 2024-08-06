import { PERMISSIONS } from '@/app-intelligent-iot/utils/permissions';
import { loginStore } from '@/store/modules/login';
import { request } from '@/utils/request';

/**
 * 进入眼小卫APP，获取是否提醒星系，true 提醒， false 不提醒
 * @returns {Promise<boolean>}
 */
const prompt = () => {
  const url = '/appClicks/actions/isClick';
  const params = {
    userId: loginStore().userInfo?.personId,
    version: import.meta.env.VITE_APP_VERSION,
    appCode: PERMISSIONS.VisionScreening,
  };

  return request(url, params, 'GET', { spaceType: request.service.quality });
};

export default prompt;
