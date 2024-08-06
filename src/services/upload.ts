import uploadToOSS from '@/services/upload-oss';
import { OverdueTask } from '@/utils/overdue-task';
import { request } from '@/utils/request';
import { showInfo } from '@/utils/tools';

export interface IGetUploadUrlRequestParams {
  locationId: string; // 组织ID，前端可不传
  fileType: string; // 文件类型，如jpg,png, pdf等。 该参数在特定存储如oss时有需要，在返回的预签名头部中会有签名要求
  bucketType: string; // 桶类型，两个值，private或者public。 private私有桶，文件的url有时效，默认一周。public无时效。系统中无特殊均使用private。
}

export interface IGetUploadUrlResponseParams {
  fileId: string; // 文件id，唯一标识，如71b73ec7575a4bc284a52a0df1f27b9d
  fileType: string; // 文件类型，如 jpg
  uploadUrl: string; // 预上传地址，重要。客户端往这个地址进行put二进制文件操作。
  header: any; // 在下一步往预上传地址进行put操作时，需要放在头部的参数。如  {"Content-Type": "image/jpeg","x-oss-meta-author":"aliy"}
}

// 获取uploadUrl
export const getUploadUrl = (params: IGetUploadUrlRequestParams) =>
  request<IGetUploadUrlResponseParams>('/files/getUploadUrl', params, 'GET', {
    spaceType: request.service.resource,
    showLoading: false,
  });

export interface IUploadFileResponseParams {
  data: string;
  header: any;
  statusCode: number;
  errMsg: string;
}

export const uploadUrlByUrl = async (
  filePath: string,
  uploadUrl: string,
  header: any,
): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    const api: UniApp.RequestOptions = {
      url: uploadUrl,
      method: 'PUT',
      header,
      data: { file: filePath },
      success(response: any) {
        console.log('upload_response : ' + JSON.stringify(response));
        const result = response as IUploadFileResponseParams;
        if (result.statusCode === 200) {
          resolve({ code: 0 }); // 成功
        } else {
          // 业务级错误
          console.log('业务级错误 : ' + JSON.stringify(result.errMsg));
          reject({ code: '-9999', desc: result.errMsg });
        }
      },
      fail(err) {
        // 网络错误
        console.log('网络错误 : ' + JSON.stringify(err));
        reject(err);
      },
    };
    uni.request(api);
  });
};

export const updateUploadResult = (fileId: string, status: number, fileName: string) =>
  request<boolean>(
    `/files/updateResult?fileId=${fileId}&fileName=${encodeURIComponent(
      fileName,
    )}&status=${status}`,
    undefined,
    'POST',
    {
      spaceType: request.service.resource,
      showLoading: false,
    },
  );

export interface IFileInfoRes {
  id: string;
  fileId: string;
  fileType: string;
  filePath: string;
  fileName: string;
  tenantId: string;
  uploadTag: number;
  fullUrl: string; // 图片地址
}

export const getFileInfo = (fileId: string) =>
  request<IFileInfoRes>('/files/getFileInfo', { fileId: fileId }, 'GET', {
    spaceType: request.service.resource,
    showLoading: false,
  });

export interface IUploadFileOptions {
  showLoading?: boolean;
  overdueShowLoadingTime?: number;
  useCompressUrl?: boolean;
  useFileUrl?: boolean;
  useUploadFile?: boolean; // 通用上传文件接口
  anon?: boolean; // 是否游客模式(不需要登录鉴权)
  isPublic?: boolean; // 公有桶/私有桶 默认私有桶
  isThumbnailUrl?: boolean; // 是否缩略图
  isFollowCloudEdge?: boolean; // 是否由locationId指定文件存云或存边
  timeout?: number; // 超时时间
  isFormDataReq?: boolean; // 请求体类型指定为FormData
}

export interface IUploadFileResult {
  fileId: string;
  fileName: string;
  fileType: string;
  presignedUrl: string;
  fullUrl: string;
  width?: number; // 压缩后的图片宽度
  height?: number; // 压缩后的图片高度
  thumbnailList?: {
    fileId: string;
    fullUrl: string;
  }[];
}

export enum EUploadURL {
  'anon' = '/building/anon/files/v2/uploadImgWithCompressAndZoom',
  'useCompressUrl' = '/sas/frontend/files/v2/uploadImgAndCompress',
  'useFileUrl' = '/resource/files/combined/upload', // 文件上传，不压缩
  'isThumbnailUrl' = '/building/files/v2/image/action/compress',
  'isFollowCloudEdge' = `/building/files/v3/uploadImgAndCompress`,
  'useUploadFile' = '/building/files/v2/uploadFile',
  'default' = '/resource/files/compress/upload',
}

/** 文件上传 */
export const uploadFile = async (
  file: any,
  filePath: string,
  optionsReq?: IUploadFileOptions,
): Promise<IUploadFileResult> => {
  const options = {
    showLoading: true,
    overdueShowLoadingTime: 1000,
    useCompressUrl: false,
    useFileUrl: false,
    anon: false,
    isPublic: false,
    isThumbnailUrl: false,
    isFormDataReq: false,
    useUploadFile: false,
  } as IUploadFileOptions;
  Object.assign(options, optionsReq || {});
  return new Promise<IUploadFileResult>((resolve, reject) => {
    const overdueTaskKey = `${new Date().getTime()}@${Math.random()}`;

    if (options.showLoading) {
      OverdueTask.addTask(overdueTaskKey, options.overdueShowLoadingTime);
    }
    const closeLoading = () => {
      if (options.showLoading) {
        OverdueTask.removeTask(overdueTaskKey);
      }
    };

    try {
      if (!file.path && filePath) {
        file.path = filePath;
      }

      uploadToOSS(file, {
        bucketType: options.isPublic ? 'public' : 'private',
        createThumbnail: options.isThumbnailUrl,
        timeout: options.timeout,
      })
        .then((res: any) => {
          console.debug('=====> uploadToOSS res', res);
          closeLoading();
          resolve(res);
        })
        .catch(error => {
          console.debug('=====> uploadToOSS err', error);
          closeLoading();
          if ((error?.data?.message).includes('fileService.fileType.is.limited')) {
            showInfo('文件格式不支持');
          } else {
            showInfo(error?.msg || error?.desc || error?.data?.message || '请求服务器失败');
          }
          reject(error);
        });
    } catch (e) {
      console.error('上传报错' + JSON.stringify(e));
      reject(e);
    }
  });
};
