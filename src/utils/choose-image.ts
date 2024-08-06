import { requestAllChooseImagePer } from '@/services/permissionRequest';
import { showInfo } from '@/utils/tools';
import { batchUploadChoosedImages } from '@/utils/upload-medias';
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface IParams {
  /** 上传最大数量 */
  maxCount?: number;
  /** 已上传图片 */
  imgList?: any[];
  /** 上传图片大小限制 */
  maxSize?: number;
  sourceType?: string[];
  sizeType?: string[];
  /** 是否提示上传结果 */
  showUploadResult?: boolean;
}

export const chooseImgStore = defineStore('chooseImgStore', () => {
  const chooseImgRes = ref<any[]>([]);
  const setChooseImgRes = (res?: any[]) => {
    chooseImgRes.value = res || [];
  };
  return {
    chooseImgRes,
    setChooseImgRes,
  };
});

const get_extname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

const chooseImg = (params?: IParams) => {
  const {
    maxCount = 1,
    imgList,
    maxSize = 5,
    sourceType = ['camera', 'album'],
    sizeType = ['original', 'compressed'],
    showUploadResult = true,
  } = params || {};

  uni.chooseImage({
    sourceType: sourceType,
    sizeType: sizeType,
    count: maxCount - (imgList?.length ?? 0),
    extension: ['jpg', 'jpeg', 'png'],
    async success(res: any) {
      const images: any[] = res.tempFiles.map((file: any) => ({
        url: file.path,
        name: file.name,
        size: file.size,
        extname: file.name ? file.name.split('.').pop() : get_extname(file.path),
      }));
      console.log('imgs : ', JSON.stringify(images));
      // 过滤尺寸（最大5M）
      const MAX_SIZE = maxSize * 1024 * 1024;
      const filter = images.filter(item => item.size <= MAX_SIZE);
      if (filter.length < images.length) {
        uni.showToast({
          title: `此图片超过了${maxSize}M, 请更换`,
        });
      }
      const uploadRes: any[] = await batchUploadChoosedImages(
        filter,
        false,
        false,
        false,
        false,
        false,
      );

      if (uploadRes.length > 0) {
        const imgData = (imgList || []).concat(uploadRes);
        const { setChooseImgRes } = chooseImgStore();
        setChooseImgRes(imgData);
        if (showUploadResult) {
          showInfo('上传成功');
        }
      }
    },
    fail: (res: any) => {
      console.log('chooseImageFaild: ' + JSON.stringify(res));
      const { code, errMsg } = res;
      console.log('code: ' + code + ', errMsg: ' + errMsg);
    },
  });
};

export const updatePhoto = async (params?: IParams) => {
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllChooseImagePer(
      res => {
        // 已有权限
        console.log('permissionRequestResult : ' + JSON.stringify(res));
        chooseImg(params);
      },
      err => {
        // 无权限
        console.log('permissionRequestFail : ' + JSON.stringify(err));
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    chooseImg(params);
  }
};
