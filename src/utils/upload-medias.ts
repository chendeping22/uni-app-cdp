import { requestAllChooseImagePer } from '@/services/permissionRequest';
import {
  IGetUploadUrlRequestParams,
  IUploadFileOptions,
  IUploadFileResult,
  getUploadUrl,
  updateUploadResult,
  uploadFile,
  uploadUrlByUrl,
} from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { IPromiseLimitRtn, promiseLimit } from './promise-limit';
import { hideLoading, showInfo, showLoading } from './tools';
// #ifdef APP-PLUS
import {
  judgeAndroidPermissionCamera,
  judgeAndroidPermissionPhotoLibrary,
  judgeIosPermissionCamera,
  judgeIosPermissionPhotoLibrary,
} from '@/app-platform/utils/app-permission';
// #endif
export interface IImageOps {
  name?: string;
  path: string;
  url?: string;
  tempFilePath?: string;
  size: number;
  extname?: string;
}
export interface IChooseImage {
  count?: number;
  sizeType?: string[];
  extension?: string[];
  sourceType?: string[];
  maxSize?: number; // 单位K
}

export interface IChooseVedio {
  maxSize?: number;
  extension?: string[];
  sourceType?: string[];
  generateFirstFlame?: boolean;
  compressed?: boolean;
  maxDuration?: number;
}

const get_extname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};
const get_fileName = (path: string) => {
  const file = path.split(/\//g).pop() || '';
  return file.replace(/\..*/, '');
};

const validPermission = async () => {
  let cameraPermission = false;
  let photoLibPermission = false;

  // #ifdef APP-PLUS
  if (plus.os.name === 'iOS') {
    cameraPermission = judgeIosPermissionCamera();
    photoLibPermission = judgeIosPermissionPhotoLibrary();
  }

  if (plus.os.name === 'Android') {
    cameraPermission = await judgeAndroidPermissionCamera();
    photoLibPermission = await judgeAndroidPermissionPhotoLibrary();
  }
  // #endif

  // #ifdef MP-WEIXIN
  [cameraPermission, photoLibPermission] = await new Promise(resolve => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve([true, true]),
      fail: () => {
        resolve([false, false]);
      },
    });
  });
  // #endif

  if (cameraPermission && photoLibPermission) {
    return ['album', 'camera'];
  }

  if (!cameraPermission && !photoLibPermission) {
    showInfo('没有摄像头及图库权限, 请前往设置授权');
    // #ifdef MP-WEIXIN
    setTimeout(() => {
      uni.openSetting({
        fail: (err: unknown) => {
          console.error('打开设置失败:', err);
        },
      });
    }, 300);
    // #endif
    return [];
  }

  if (!cameraPermission) {
    showInfo('没有摄像头权限, 请前往设置授权');
    return ['album'];
  }
  showInfo('没有图库权限, 请前往设置授权');
  return ['camera'];
};

export const chooseImage = async (options: IChooseImage) => {
  const {
    count = 9,
    sizeType = ['compressed'],
    maxSize = 5, // 默认5M
    sourceType = ['album', 'camera'],
    extension = ['jpg', 'png'],
  } = options;
  console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ sizeType:', sizeType);
  return new Promise<IImageOps[]>(resolve => {
    let platformAndroid = false;
    // #ifdef APP-PLUS
    // App且是android需要权限使用说明（华为上架要求）
    if (plus.os.name === 'Android') {
      platformAndroid = true;
      requestAllChooseImagePer(
        res => {
          // 已有权限
          console.log('permissionRequestResult : ' + JSON.stringify(res));
          uni.chooseImage({
            count,
            sizeType,
            sourceType,
            extension,
            success: res => {
              const files = res.tempFiles as IImageOps[];
              if (files.length > count) {
                showInfo(`最多选择${count}张图片`);
                resolve([]);
              }
              files.forEach(f => {
                if (f.size > 1024 * 1024 * maxSize) {
                  showInfo(`图片不能超过${maxSize}MB`);
                  resolve([]);
                }
                f.extname = f.name ? f.name.split('.').pop() : get_extname(f.path);
              });
              resolve(files);
            },
            fail: (res: any) => {
              console.log('chooseImageFaild: ' + JSON.stringify(res));
              const { code, errMsg } = res;
              console.log('code: ' + code + ', errMsg: ' + errMsg);
            },
          });
        },
        err => {
          // 无权限
          console.log('permissionRequestFail : ' + JSON.stringify(err));
        },
      );
    }
    // #endif

    if (!platformAndroid) {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        extension,
        success: res => {
          const files = res.tempFiles as IImageOps[];

          if (files.length > count) {
            showInfo(`最多选择${count}张图片`);
            resolve([]);
          }
          files.forEach(f => {
            if (f.size > 1024 * 1024 * maxSize) {
              showInfo(`图片不能超过${maxSize}MB`);
              resolve([]);
            }
            f.extname = f.name ? f.name.split('.').pop() : get_extname(f.path);
          });
          resolve(files);
        },
        fail: async function (res) {
          console.log('chooseImageFaild: ' + JSON.stringify(res));
          const { code, errMsg } = res;
          console.log('code: ' + code + ', errMsg: ' + errMsg);
          // 权限验证
          // #ifndef H5
          // 11: android没有拍照权限 12: android没有图库权限
          // 2: ios没有拍照权限 8: ios没有图库权限
          if (code === 2 || code === 8 || code === 11 || code == 12) {
            if (errMsg !== 'chooseImage:fail cancel') {
              const permissionResult = await validPermission();
              console.log('permissionResult = ', permissionResult);
            }
          }
          // #endif
        },
      });
    }
  });
};

/** 上传图片包装 */
export const uploadImage = async (file: IImageOps, inx: number, options: IUploadFileOptions) => {
  return new Promise<IPromiseLimitRtn>((resolve, reject) => {
    uploadFile(file, file.path, options)
      .then(res => {
        resolve({ inx, res: res as IUploadFileResult, code: 200 });
      })
      .catch(c => {
        reject({ inx, res: c, code: c.code });
      });
  });
};

/** 批量上传图片, 添加节流功能, 避免报429（暂时不要使用, 尚小问题） */
const _batchUploadChoosedImages = async (images: IImageOps[], options: IUploadFileOptions) => {
  return await promiseLimit<IImageOps, IUploadFileResult>(images, uploadImage, 1, 100, options);
};

/** 批量上传已选中的图片 */
export const batchUploadChoosedImages = async (
  files: IImageOps[],
  showSuccess = true,
  useCompressUrl = false,
  anon = false,
  isPublic = false,
  isThumbnailUrl = false,
  isFollowCloudEdge = false,
  isFormDataReq = false,
) => {
  files.forEach(tmp => {
    if (!tmp.path && tmp.url) {
      tmp.path = tmp.url;
    }
  });
  showLoading('上传中');
  // 批量上传
  const uploadRes = await _batchUploadChoosedImages(files, {
    showLoading: false,
    useCompressUrl,
    anon,
    isPublic,
    isThumbnailUrl,
    isFollowCloudEdge,
    isFormDataReq,
  });
  console.log('图片上传结果: ', JSON.stringify(uploadRes));
  hideLoading();

  const sussRes = uploadRes
    .filter(f => f.code === 200)
    .map(({ res }) => {
      if (!res.fileId) {
        return null;
      }
      return {
        type: 1,
        fileId: res.fileId,
        url: res.fullUrl ? res.fullUrl : res.presignedUrl,
        name: res.fileName,
        thumbnail:
          isThumbnailUrl && res?.thumbnailList?.length
            ? {
                type: 1,
                fileId: res.thumbnailList[0].fileId,
                url: res.thumbnailList[0].fullUrl,
              }
            : undefined,
      };
    })
    .filter(Boolean);
  console.log('sussRes : ', sussRes);
  if (showSuccess) {
    uni.showModal({
      content: `${sussRes.length}个文件上传成功,\n${files.length - sussRes.length}个文件上传失败`,
      showCancel: false,
    });
  }
  return sussRes;
};

/** 选择并批量上传图片 */
export const chooseAndUploadImage = async (
  medias = [],
  max = 9,
  showSuccess = true,
  useCompressUrl = false,
  isPublic = false,
  maxSize = 5,
  needThumbnail = false,
  sourceType = ['album', 'camera'],
  isFormDataReq = false,
  sizeType = ['compressed'],
) => {
  // const curCount = medias.filter(m => m.type === 1).length;
  // if (curCount >= max) {
  //   showInfo(`最多上传${max}张图片`);
  //   return [];
  // }
  // console.log('max : ', max);
  // console.log('curCount : ', curCount);
  const files = await chooseImage({ count: max, maxSize, sourceType, sizeType });
  if (files.length === 0) {
    return [];
  }
  // if (curCount + files.length > max) {
  //   showInfo(`最多选择${max - curCount}张图片`);
  //   return [];
  // }
  console.log('needThumbnail : ', needThumbnail);
  const sussRes = await batchUploadChoosedImages(
    files,
    false,
    useCompressUrl,
    false,
    isPublic,
    needThumbnail,
    false,
    isFormDataReq,
  );
  if (needThumbnail) {
    return [[...files], [...sussRes], [...sussRes.map(item => item?.thumbnail || item)]];
  }
  return sussRes;
};

export const uploadFileChoice = async () => {
  //#ifdef H5
  uni.chooseFile({
    count: 1, // 文件数量
    extension: ['.zip', '.doc', '.xls', '.pdf', 'docx', '.rar', '.7z', '.jpg', '.png', '.jpeg'],
    //文件类型
    async success(res) {
      console.log('tempFile : ' + JSON.stringify(res.tempFiles[0].type.split('/').pop())); //临时文件地址
    },
    fail(err) {
      console.log('chooseFile_error : ' + JSON.stringify(err)); //失败，（没有权限或取消）
    },
  });
  //#endif
  //#ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1, // 默认100
    success: res => {
      console.log('tempFile : ' + JSON.stringify(res.tempFiles[0])); //临时文件地址
      if (res.tempFiles && res.tempFiles.length > 0) {
        uploadFileSimple(
          res.tempFiles[0].name.split('.').pop() || '',
          res.tempFiles[0].name,
          res.tempFiles[0].path,
        );
      }
    },
  });
  //#endif
};

export const uploadFileSimple = async (fileType: string, fileName: string, filePath: string) => {
  const store = loginStore();
  const requestParams = {
    locationId: store.userInfo?.locationId,
    fileType: fileType,
    bucketType: 'private',
  } as IGetUploadUrlRequestParams;
  const getUploadUrlData = await getUploadUrl(requestParams);
  console.log('getUploadUrlData : ' + JSON.stringify(getUploadUrlData));
  if (getUploadUrlData) {
    const header = getUploadUrlData.header;
    // header['Content-Type'] = 'multipart/form-data';
    // header['Content-Disposition'] = 'attachment;filename=' + fileName;
    const uploadFileResp = await uploadUrlByUrl(filePath, getUploadUrlData.uploadUrl, header);
    console.log('uploadFileResp : ' + JSON.stringify(uploadFileResp));
    if (uploadFileResp.code === 0) {
      updateUploadResult(getUploadUrlData.fileId, 1, fileName);
    }
    // uni.uploadFile({
    //   url: getUploadUrlData.uploadUrl, // 服务器接口地址
    //   method: 'PUT', // 指定为PUT方法
    //   header: { 'Content-Type': 'multipart/form-data' }, // 设置请求头部信息
    //   filePath: filePath, // 需要上传的文件路径
    //   name: 'file', // 后台接收文件时对应的字段名称
    //   formData: {
    //     _method: 'PUT',
    //   },
    //   success(res) {
    //     console.log('文件上传成功');
    //     console.log(res);

    //     // 处理上传成功后的逻辑...
    //   },
    //   fail(err) {
    //     console.error('文件上传失败');
    //     console.error(err);

    //     // 处理上传失败后的逻辑...
    //   },
    // });
  }
};

/////////////////////////////////////////////////////////////////////////////////
/** 以下是视频的相关方法 */

export const chooseVideo = async (options: IChooseVedio) => {
  const {
    maxSize = 100,
    sourceType = ['album', 'camera'],
    extension = ['.mp4', '.mov', '.avi', '.flv', '.hevc'],
    ...rest
  } = options;
  return new Promise<UniApp.ChooseVideoSuccess | null>(resolve => {
    uni.chooseVideo({
      sourceType,
      extension,
      ...rest,
      success: (file: UniApp.ChooseVideoSuccess) => {
        if ((file.size || 0) > 1024 * 1024 * maxSize) {
          showInfo(`视频不能超过${maxSize}MB`);
          resolve(null);
        }
        const extname = get_extname(file.name || file.tempFilePath || '');
        if (extname !== 'mp4') {
          showInfo(`只支持上传.mp4、.hevc格式`);
          resolve(null);
        }

        const obj = {
          ...file,
          extname,
          fileName: get_fileName(file.tempFilePath || ''),
        };
        resolve(obj);
      },
    });
  });
};

/** 选择并上传视频、缩略图 */
export const chooseAndUploadVideo = async (
  options: IChooseVedio,
  uploadOptions?: IUploadFileOptions,
): Promise<UniApp.ChooseVideoSuccess | [UniApp.ChooseVideoSuccess, IUploadFileResult] | null> => {
  const res = await chooseVideo(options);

  if (res) {
    if (options?.generateFirstFlame) {
      // 视频首帧，暂时无法做
    }
    try {
      showLoading('上传中');
      if (options.compressed === false && res.size > 1024 * 1024 * 100) {
        // 大于100的视频进行压缩
        const result = await new Promise<any>(resolve => {
          uni.compressVideo({
            src: res.tempFilePath,
            bitrate: res.size / res.duration / 100,
            fps: 0.01,
            resolution: 1,
            success: async (file: { tempFilePath: string; size: string }) => {
              const uploadRes = await uploadFile(file, file.tempFilePath || '', uploadOptions);
              hideLoading();
              showInfo('上传成功');
              resolve([file, uploadRes]);
            },
          });
        });
        return result;
      } else {
        const uploadRes = await uploadFile(res, res.tempFilePath || '', uploadOptions);

        hideLoading();
        showInfo('上传成功');
        return [res, uploadRes];
      }
    } catch (e) {
      hideLoading();
      showInfo('上传失败');
    }
  }

  return res;
};
