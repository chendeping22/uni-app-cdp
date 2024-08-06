import { request } from '@/utils/request';

// const prefix = '/staffAttend';

// 获取配置数据
export const findByLocationId = () => {
  // return Http.getInstance().get(prefix + '/topicMaterialConfigs/findByLocationId');
  return request('/topicMaterialConfigs/findByLocationId', {}, 'GET', {
    spaceType: request.service.staffAttend,
    showLoading: false,
  });
};
