import { loginStore } from '@/store/modules/login';
import { request } from '@/utils/request';
import { type IImageOps } from '../utils/upload-medias';
// #ifdef APP-PLUS
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
// #endif

const spaceType = request.service.resource;

function getUploadUrl({ locationId, bucketType, fileType, timeout }: GetUploadUrlParams) {
  return request<UploadUrlResult>(
    '/files/getUploadUrl',
    {
      locationId,
      bucketType,
      fileType,
    },
    'GET',
    {
      spaceType,
      timeout,
      defaultError: false,
    },
  );
}

function getName(content: string) {
  let name = '';

  if (/^data\:[^;]+/.test(content)) {
    const match = content.match(/^data\:([^;]+)/);
    name = Date.now().toString();
    if (match) {
      name += '.' + match[1].replace(/^[^/]+\//, '');
    }
  }

  if (!name) {
    const match = content?.match(/[^/]+$/);
    if (match) {
      name = match[0];
    }
  }

  return name;
}

function getExtname(content: string) {
  let extname = '';

  if (/^data\:[^;]+/.test(content)) {
    const match = content.match(/^data\:([^;]+)/);
    if (match) {
      extname = match[1].replace(/^[^/]+\//, '');
    }
  }

  if (!extname) {
    const match = content?.match(/[^.]+$/);
    if (match) {
      extname = match[0];
    }
  }

  return extname;
}

// #ifdef H5
async function uploadOnH5(
  { locationId, filePath, fileName, fileType, arrayBuffer }: BaseUploadParams,
  options: UploadToOSSOptions,
) {
  const { bucketType, timeout } = options;
  let fileId = '';
  // 1. 获取上传文件路径
  // 2. 获取文件ArrayBuffer对象
  const [uploadUrlResult, buffer]: any[] = await Promise.all([
    getUploadUrl({
      locationId,
      bucketType,
      fileType,
      timeout,
    }),
    new Promise((resolve, reject) => {
      if (arrayBuffer) {
        resolve(arrayBuffer);
      } else if (FileReader) {
        const request = new XMLHttpRequest();
        request.open('GET', filePath, true);
        request.responseType = 'blob';
        request.onload = function () {
          const reader = new FileReader();
          reader.readAsArrayBuffer(request.response);
          reader.onload = function (e) {
            if (e.target) {
              resolve(e.target.result);
            } else {
              reject();
            }
          };
        };
        request.onerror = reject;
        request.send();
      } else {
        reject();
      }
    }),
  ]);
  fileId = uploadUrlResult.fileId;

  // 3. 直传OSS服务
  const uploadResponse = await uni.request({
    url: uploadUrlResult.uploadUrl,
    method: 'PUT',
    header: uploadUrlResult.header,
    data: buffer,
    timeout,
  });

  if (!fileName || fileName === '<Undefined>') {
    const match = filePath?.match(/[^/]+$/);
    fileName = match ? match[0] : `${fileId}.${fileType}`;
  }

  // 4. 上报OSS上传结果
  const result = await request<boolean>(
    `/files/updateResult?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}&status=${
      uploadResponse.statusCode === 200 ? 1 : 0
    }`,
    undefined,
    'POST',
    {
      spaceType,
      timeout,
    },
  );

  if (!result) {
    throw new Error('上传文件失败');
  }

  // 4.1. 生成缩略图
  let thumbnailRes: any;
  if (options.createThumbnail) {
    // await request<FileInfo>(
    //   `/files/createThumbnail?fileId=${fileId}&targetSizeKb=500`,
    //   undefined,
    //   'POST',
    //   {
    //     spaceType,
    //     timeout,
    //   },
    // );

    // #ifndef H5
    await uni
      .compressImage({
        src: filePath,
        compressedWidth: 150,
      })
      .then(res => {
        if (res.tempFilePath) {
          return uploadToOSS(res.tempFilePath, {
            ...options,
            createThumbnail: false,
          }).then(res => {
            thumbnailRes = res;
          });
        }
      });
    // #endif
  }

  // 5. 获取文件信息
  const info = await request<FileInfo>(
    '/files/getFileInfo',
    {
      fileId,
    },
    'GET',
    {
      spaceType,
    },
  );

  if (thumbnailRes) {
    info.thumbnailList = [
      {
        fileId: thumbnailRes.fileId,
        fullUrl: thumbnailRes.fullUrl,
      },
    ];
  }

  return info;
}
// #endif

// #ifdef MP-WEIXIN
async function uploadOnMP(
  { locationId, filePath, fileName, fileType, arrayBuffer }: BaseUploadParams,
  options: UploadToOSSOptions,
) {
  const { bucketType, timeout } = options;
  let fileId = '';
  // 1. 获取上传文件路径
  // 2. 获取文件ArrayBuffer对象
  const [uploadUrlResult, buffer]: any[] = await Promise.all([
    getUploadUrl({
      locationId,
      bucketType,
      fileType,
      timeout,
    }),
    new Promise((resolve, reject) => {
      if (arrayBuffer) {
        resolve(arrayBuffer);
      } else {
        const fs = uni.getFileSystemManager();
        fs.readFile({
          filePath,
          success: res => {
            resolve(res.data);
          },
          fail: reject,
        });
      }
    }),
  ]);
  fileId = uploadUrlResult.fileId;

  // 3. 直传OSS服务
  const uploadResponse = await uni.request({
    url: uploadUrlResult.uploadUrl,
    method: 'PUT',
    header: uploadUrlResult.header,
    data: buffer,
    timeout,
  });

  if (!fileName || fileName === '<Undefined>') {
    const match = filePath?.match(/[^/]+$/);
    fileName = match ? match[0] : `${fileId}.${fileType}`;
  }

  // 4. 上报OSS上传结果
  const result = await request<boolean>(
    `/files/updateResult?fileId=${fileId}&fileName=${encodeURIComponent(fileName)}&status=${
      uploadResponse.statusCode === 200 ? 1 : 0
    }`,
    undefined,
    'POST',
    {
      spaceType,
      timeout,
    },
  );

  if (!result) {
    throw new Error('上传文件失败');
  }

  // 4.1. 生成缩略图
  let thumbnailRes: any;
  if (options.createThumbnail) {
    // await request<FileInfo>(
    //   `/files/createThumbnail?fileId=${fileId}&targetSizeKb=500`,
    //   undefined,
    //   'POST',
    //   {
    //     spaceType,
    //     timeout,
    //   },
    // );

    // #ifndef H5
    await uni
      .compressImage({
        src: filePath,
        compressedWidth: 150,
      })
      .then(res => {
        if (res.tempFilePath) {
          return uploadToOSS(res.tempFilePath, {
            ...options,
            createThumbnail: false,
          }).then(res => {
            thumbnailRes = res;
          });
        }
      });
    // #endif
  }

  // 5. 获取文件信息
  const info = await request<FileInfo>(
    '/files/getFileInfo',
    {
      fileId,
    },
    'GET',
    {
      spaceType,
    },
  );

  if (thumbnailRes) {
    info.thumbnailList = [
      {
        fileId: thumbnailRes.fileId,
        fullUrl: thumbnailRes.fullUrl,
      },
    ];
  }

  return info;
}
// #endif

// #ifdef APP-PLUS
async function uploadOnApp(
  { locationId, filePath, fileName, fileType, arrayBuffer }: BaseUploadParams,
  options: UploadToOSSOptions,
) {
  const { bucketType, timeout } = options;
  let fileId = '';

  const [uploadUrlResult, systemUrl] = await Promise.all([
    getUploadUrl({
      locationId,
      bucketType,
      fileType,
      timeout,
    }),
    new Promise((resolve, reject) => {
      // uni.getImageInfo({
      //   src: filePath,
      //   success: res => {
      //     if (res.path) {
      //       resolve(res.path);
      //     }
      //   },
      //   fail: (err: any) => {
      //     reject(err);
      //   },
      // });

      let systemUrl = plus.io.convertLocalFileSystemURL(filePath);
      const { platform } = uni.getSystemInfoSync();
      if (platform === 'ios') {
        systemUrl = 'file://' + systemUrl;
      }
      resolve(systemUrl);
    }),
  ]);
  fileId = uploadUrlResult.fileId;

  const { status }: any = await callBridge({
    service: Service.file,
    action: Action.fileUpload,
    data: {
      uploadUrl: uploadUrlResult.uploadUrl,
      header: uploadUrlResult.header,
      filePath: systemUrl,
      fileType: uploadUrlResult.fileType,
    },
  });

  // 4.1. 生成缩略图
  let thumbnailRes: any;
  if (options.createThumbnail) {
    await uni
      .compressImage({
        src: filePath,
        compressedWidth: 150,
      })
      .then(res => {
        if (res.tempFilePath) {
          return uploadToOSS(res.tempFilePath, {
            ...options,
            createThumbnail: false,
          }).then(res => {
            thumbnailRes = res;
          });
        }
      });
  }

  // 5. 获取文件信息
  const info = await request<FileInfo>(
    '/files/getFileInfo',
    {
      fileId,
    },
    'GET',
    {
      spaceType,
    },
  );

  if (thumbnailRes) {
    info.thumbnailList = [
      {
        fileId: thumbnailRes.fileId,
        fullUrl: thumbnailRes.fullUrl,
      },
    ];
  }

  return info;
}
// #endif

export default async function uploadToOSS(
  file: IImageOps | string,
  options: UploadToOSSOptions = {
    bucketType: 'public',
  },
) {
  const store = loginStore();
  const locationId = store.userInfo?.locationId as string;
  let filePath = '';
  let fileName = '';
  let fileType = '';
  let arrayBuffer: ArrayBuffer | undefined = undefined;

  if (typeof file === 'object') {
    filePath = file.url || file.tempFilePath || file.path;
    fileName = file.name || '';
    fileType = file.extname || '';
  } else {
    filePath = file;
  }

  if (/^data\:[^;]+;base64,/i.test(filePath)) {
    const base64 = filePath.replace(/^data\:[^;]+;base64,/i, '');
    arrayBuffer = uni.base64ToArrayBuffer(base64);
  }

  if (!fileType) {
    fileType = getExtname(fileName || filePath);
  }
  if (!fileName) {
    fileName = getName(filePath);
  }

  let res;

  // #ifdef H5
  res = await uploadOnH5({ locationId, filePath, fileName, fileType, arrayBuffer }, options);
  // #endif

  // #ifdef MP-WEIXIN
  res = await uploadOnMP({ locationId, filePath, fileName, fileType, arrayBuffer }, options);
  // #endif

  // #ifdef APP-PLUS
  if (arrayBuffer) {
    res = await uploadOnH5({ locationId, filePath, fileName, fileType, arrayBuffer }, options);
  } else {
    res = await uploadOnApp({ locationId, filePath, fileName, fileType }, options);
  }
  // #endif

  // NOTE: 兼容旧机制字段
  if (res?.fullUrl) {
    res.presignedUrl = res.fullUrl;
  }

  return res;
}

/** === type =================================== */

type BucketType = 'public' | 'private';

interface BaseUploadParams {
  locationId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  arrayBuffer?: ArrayBuffer;
}
interface GetUploadUrlParams {
  locationId: string;
  bucketType: BucketType;
  fileType: string;
  timeout?: number;
}

interface UploadToOSSOptions {
  /** 上传桶类型，公有 | 私有 */
  bucketType: BucketType;
  /** 是否生成缩略图 */
  createThumbnail?: boolean;
  /** 超时时间 */
  timeout?: number;
}

interface UploadUrlResult {
  fileId: string;
  fileType: string;
  uploadUrl: string;
  header: any;
}

interface UploadFileResult {
  data: string;
  statusCode: number;
  errMsg: string;
}

interface FileInfo {
  id: string;
  fileId: string;
  fileType: string;
  tenantId: string;
  filePath: string;
  fileName: string;
  uploadTag: number;
  expiredTime: number;
  fileTag: any;
  relFileId: any;
  fileSize: any;
  fileDuration: any;
  createTime: number;
  updateTime: number;
  fullUrl: string;
  thumbnailList: {
    fileId: string;
    fullUrl: string;
  }[];
  convertList: any[];
  videoSnapshot: any;
  dbFileId: string;
  publicBucket: boolean;
  presignedUrl?: string;
}
