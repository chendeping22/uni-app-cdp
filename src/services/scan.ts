import { request } from '@/utils/request';
/** 班牌会议模式用户签到 */
export const meetingSignIn = (reserveId: string | number) =>
  request<{ code: number; desc: string }>(
    `/personClickRecords/actions/clockIn`,
    { reserveId },
    'POST',
    {
      spaceType: request.service.ioc,
      defaultError: false,
    },
  );
