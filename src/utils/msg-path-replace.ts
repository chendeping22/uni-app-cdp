import { omit } from '@/utils/lodash-es';
import { setPageParams, setUrlStartWithSlash } from '@/utils/tools';
// 兼容旧基座消息路径
export const msgPathReplace = (redirectUrl: string, urlParams: any) => {
  if (redirectUrl.includes('pages/notification/attendance-detail')) {
    const { frequency } = urlParams.value;
    console.log('frequency : ' + frequency);
    if (frequency) {
      return setUrlStartWithSlash(
        `/dormitory-attendance/detail${setPageParams(omit(urlParams.value, 'redirect'), '?')}`,
      );
    } else {
      return setUrlStartWithSlash(
        `/dormitory-attendance/attendance-detail${setPageParams(
          omit(urlParams.value, 'redirect'),
          '?',
        )}`,
      );
    }
  } else if (redirectUrl.includes('pages/notification/access-notification-detail')) {
    return setUrlStartWithSlash(
      `/app-school-safe/access-management/alarm-notification-detail${setPageParams(
        omit(urlParams.value, 'redirect'),
        '?',
      )}`,
    );
  }
  return redirectUrl;
};
