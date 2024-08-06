import { request } from '@/utils/request';

/** 用户获取文件真实路径 */
export const getFileUrl = (fileId: string) =>
  request<{ presignedUrl: string; fileName: string; fileId: string }>(
    `/api/file/v2/service/getGetUrl?fileId=${fileId}`,
    {},
    'POST',
    {
      spaceType: request.service.file,
    },
  );

/** 用户获取文件真实路径(云端专用) */
export const getCloudFileUrl = (fileId: string) =>
  request<{ presignedUrl: string }>(`/file/service/proxy/getGetUrl?fileId=${fileId}`, {}, 'POST', {
    spaceType: request.service.building,
  });
