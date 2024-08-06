import { request } from '@/utils/request';

/** 获取成员初始化信息 */
export const getInitMember = (id: string) => {
  // return Http.getInstance().get(prefix + '/actions/getInitMember?userId=' + id);
  return request(
    `/topicMembers/actions/getInitMember`,
    {
      userId: id,
    },
    'GET',
    {
      spaceType: request.service.staffAttend,
      showLoading: true,
    },
  );
};

/** 批量获取成员初始化信息 */
export const getInitMembers = (ids: string[]) => {
  return request<any[]>(
    `/topicMembers/actions/getInitMembers`,
    {
      userIds: ids.join(','),
    },
    'GET',
    {
      spaceType: request.service.staffAttend,
      showLoading: true,
    },
  );
};
