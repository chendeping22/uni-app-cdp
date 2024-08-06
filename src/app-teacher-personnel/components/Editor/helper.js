import request from '@/utils/request';
import { getUploadFileInfo, getUploadUrl, updateUploadResult } from './api';

export async function doUploadFile(file) {
  const fileType = file.name?.split('.')?.pop()?.toLowerCase();
  const data = {
    locationId: 999, // 文件服务根据Token解析出locationId
    fileType,
  };
  try {
    // 获取预上传地址
    const uploadInfo = await getUploadUrl(data);
    const { fileId, header, uploadUrl } = uploadInfo.data || {};

    const fileData = await new Promise((resolve, reject) => {
      try {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result); // 获取文件内容
        };
        fileReader.readAsArrayBuffer(
          file,
          // /image/.test(file.type) ? file : file.file
        );
      } catch (error) {
        reject(error);
      }
    });
    const res = await request({
      url: uploadUrl,
      data: fileData,
      method: 'put',
      header: header || {},
      responseType: 'arraybuffer',
      throwResponse: true,
    });
    console.log('🚀ccc ~ res:', res);
    const uploadResult = {
      fileId: fileId,
      // fileName: "_200x100.png",
      fileName: file.name,
      status: 1,
    };
    await updateUploadResult(uploadResult);
    return await getUploadFileInfo(uploadResult);
  } catch (error) {
    console.log('🚀ccc ~ error', error);
  }
}
