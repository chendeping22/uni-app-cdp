import request from '@/utils/request';

const Api = {
  PreviewFile: '/api/file/Uploader/Preview',
  Merge: '/api/file/merge',
  GetUploadURL: '/api/resource/files/getUploadUrl',
  UpdateUploadResult: '/api/resource/files/updateResult',
  GetUploadFileInfo: '/api/resource/files/getFileInfo',
};

// 从文件服务 获取文件上传地址
export function getUploadUrl(data) {
  data['bucketType'] = 'public'; //私有桶会过期
  return request({ url: Api.GetUploadURL, data, method: 'get' });
}
// 更新文件上传结果 到文件服务
export function updateUploadResult(data) {
  return request({
    url: Api.UpdateUploadResult,
    data,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
}
// 从文件服务 获取文件地址等信息
export function getUploadFileInfo(data) {
  return request({ url: Api.GetUploadFileInfo, data, method: 'get' });
}
