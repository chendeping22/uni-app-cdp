import { omit } from '@/utils/lodash-es';
import { request, TRequestOptions } from '@/utils/request';
import { InformationType } from '../infos/types';

/**
 * 组织级别
 */
export enum IInfoType {
  /** 资讯 */
  info = 1,
  /** 相册 */
  album = 4,
  /** 视频 */
  video = 5,
}

/**资讯信息 */
export interface IInfoInfo {
  id: string;
  title: string;
  type: IInfoType;
  typeName: string;
  createTime: number;
  reviewTime: number;
  fileUrl: string;
  fileId: string;
  content: string;
  reviewStatus: ReviewStatus;
}

/**
 * 审核列表
 * @param pageNum
 * @param status
 */
export const queryReviewList = (pageNum: number, status: number) => {
  return request(
    '/auditors/actions/queryPage',
    {
      pageNum,
      pageSize: 15,
      status,
    },
    'GET',
    {
      spaceType: request.service?.campus,
      showLoading: false,
    },
  );
};

/**
 * 组织级别
 */
export enum ReviewStatus {
  /** 待审核 */
  waiting = 1,
  /** 已通过 */
  approved = 2,
  /** 已驳回 */
  rejected = 3,
}

/**资讯详情信息 */
export interface IInfoDetail {
  title: string;
  auditorId: string;
  createName: string;
  createTime: number;
  publishTime: number;
  reviewStatus: ReviewStatus;
  content: string;
  type: IInfoType;
  fileList: Array<any>;
}

/**
 * 审核详情
 * @param id
 */
export const queryReviewDetail = (id: string, source: string) => {
  return request(`/schoolPublishInfos/${id}`, { source }, 'GET', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 驳回
 * @param id
 */
export const reviewRefuse = (ids: string[]) => {
  return request(`/auditors/actions/batchRefuse`, { ids }, 'POST', {
    spaceType: request.service?.campus,
    showLoading: false,
    defaultError: false,
  });
};

/**
 * 同意
 * @param id
 */
export const reviewAgree = (ids: string[]) => {
  return request(`/auditors/actions/batchAgree`, { ids }, 'POST', {
    spaceType: request.service?.campus,
    showLoading: false,
    defaultError: false,
  });
};

/**
 * 资讯列表
 * @param pageNum
 */
export const querySchoolPublishInfos = (params, options?: Partial<TRequestOptions>) => {
  return request('/schoolPublishInfos/mobile', params, 'GET', {
    spaceType: request.service?.campus,
    showLoading: false,
    ...options,
  });
};

/**
 * 发布资讯
 * @param params
 */
export const publishInfos = params => {
  return request('/schoolPublishInfos', params, 'POST', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 编辑资讯
 * @param params
 */
export const editInfos = (params, id) => {
  return request(`/schoolPublishInfos/${id}`, params, 'PUT', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 资讯|相册详情
 * @param pageNum
 */
export const querySchoolPublishInfosDetail = id => {
  return request(`/schoolPublishInfos/${id}`, null, 'GET', {
    spaceType: request.service?.campus,
    showLoading: true,
  });
};

/**
 * 相册列表
 * @param pageNum
 */
export const querySchoolPublishAlbum = (params, options?: Partial<TRequestOptions>) => {
  return request('/schoolPublishInfos/actions/queryPage', params, 'GET', {
    spaceType: request.service?.campus,
    showLoading: false,
    ...options,
  });
};
/**
 * 发布相册
 */
export const publishAlbum = (params, options?: Partial<TRequestOptions>) => {
  return request('/schoolPublishInfos/actions/saveClazzVideoOrAlbum', params, 'POST', {
    spaceType: request.service?.campus,
    showLoading: false,
    ...options,
  });
};

/**
 * 更新相册|视频
 */
export const updateAlbum = (id: string, params, options?: Partial<TRequestOptions>) => {
  return request(`/schoolPublishInfos/${id}/clazzVideoOrAlbum`, params, 'PUT', {
    spaceType: request.service?.campus,
    showLoading: false,
    ...options,
  });
};

/**
 * 相册|视频删除
 * @param id
 */
export const deleteAlbumVideo = id => {
  return request(`/schoolPublishInfos/${id}/actions/delete`, null, 'DELETE', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 资讯删除
 * @param id
 */
export const deleteInfos = id => {
  return request(`/schoolPublishInfos/${id}`, null, 'DELETE', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 上 1|下线 4
 * @param pageNum
 */
export const onOffLineAlbum = (params: { status: number; id: string }) => {
  const { id } = params;
  return request(`/schoolPublishInfos/${id}/actions/toggleOnOffLine`, omit(params, 'id'), 'PUT', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

/**
 * 置顶 1 |取消置顶 0
 * @param pageNum
 */
export const toggleTopDisplay = (params: { topDisplay: number; id: string }) => {
  const { id } = params;
  return request(`/schoolPublishInfos/${id}/actions/toggleTopDisplay`, omit(params, 'id'), 'PUT', {
    spaceType: request.service?.campus,
    showLoading: false,
  });
};

export const queryInfoList = (params: {
  pageNum: number;
  pageSize: number;
  type?: InformationType;
}) => {
  return request('/schoolPublishInfos/actions/queryPage', params, 'GET', {
    spaceType: request.service?.campus,
  });
};

export const fetchVideoSnapshot = (
  params: { fileId: string },
  options?: Partial<TRequestOptions>,
) => {
  return request(`/api/file/v2/service/videoSnapshot?fileId=${params.fileId}`, params, 'POST', {
    spaceType: request.service?.file,
    showLoading: false,
    defaultError: false,
    ...options,
  });
};
