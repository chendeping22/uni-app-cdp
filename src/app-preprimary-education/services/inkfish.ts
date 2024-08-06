import { request } from '@/utils/request';

export interface IGetNotificationReturn {
  appScope: number | null;
  appletScope: number | null;
  content: string | null;
  id: string | null;
  status: number | null;
  webScope: number | null;
}
export const getNotification = () =>
  request<IGetNotificationReturn>('/anon/publishInfo', {}, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
