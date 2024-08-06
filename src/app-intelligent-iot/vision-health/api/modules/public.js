import { request } from '@/utils/request';

export default {
  // 查询字典
  getDictItems(params) {
    return request('/sys/api/getDict', params, 'GET', { spaceType: request.service.vision });
  },
};
