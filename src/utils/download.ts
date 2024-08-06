import { getCloudFileUrl } from '@/services/file';
import { log, showConfirm, showInfo, transformImageUrl } from './tools';

export const download_pdf = async (fileId: string) => {
  // 只从云端获取
  const res = await getCloudFileUrl(fileId);

  const url = transformImageUrl(res.presignedUrl);
  console.log('TCL: download_pdf -> url', url);
  uni.downloadFile({
    url,
    success: function (res) {
      const filePath = res.tempFilePath;
      uni.openDocument({
        filePath: filePath,
        fail: () => {
          showConfirm({ content: '未找到可以打开PDF文件的软件', showCancel: false });
        },
      } as any);
    },
  });
};

export const download_file = async (url: string, type: number) => {
  console.log('TCL: download_file -> url', url);
  return new Promise(resolve => {
    const props = {};
    // #ifdef MP-WEIXIN
    // if (uni?.env?.USER_DATA_PATH) {
    //   props = {
    //     filePath: uni.env.USER_DATA_PATH + '/file.jpg',
    //   };
    // }
    console.log('TCL: download_file -> props', props);
    // #endif

    uni.downloadFile({
      ...props,
      url,
      success: function (res) {
        console.log('TCL: download_file -> res', res);
        const filePath = res.tempFilePath;
        // uni.saveVideoToPhotosAlbum
        if (type === 1) {
          uni.saveImageToPhotosAlbum({
            filePath,
            success() {
              console.info('下载成功');
              resolve(1);
            },
            fail(e) {
              log('下载失败', e);
              if (
                e.errMsg.includes('auth') || // 小程序
                e.errMsg.includes('Permission') || // 安卓app
                e.errMsg.includes('access') // 苹果app
              ) {
                resolve(-1);
              } else {
                resolve(0);
              }
            },
          });
        } else {
          uni.saveVideoToPhotosAlbum({
            filePath,
            success() {
              console.info('下载成功');
              resolve(1);
            },
            fail(e) {
              log('下载失败', e);
              if (
                e.errMsg.includes('auth') ||
                e.errMsg.includes('Permission') ||
                e.errMsg.includes('access')
              ) {
                resolve(-1);
              } else {
                resolve(0);
              }
            },
          });
        }
      },
      fail(f) {
        log('TCL: fail -> f', f);
        resolve(0);
      },
    });
  });
};

/** 批量下载 */
export const batchDownLoad = async (urls: string[], types: number[]) => {
  uni.showLoading({ title: '下载中' });
  const iterator = urls.map((url, inx) => download_file(url, types[inx]));
  const res = await Promise.all(iterator);
  uni.hideLoading();
  const successCount = res.filter(t => t === 1);
  if (res.some(t => t === -1)) {
    showInfo('保存失败!\n请先开启相册权限');
    return;
  }
  if (urls.length === 1) {
    showInfo(successCount.length === 1 ? '保存成功' : '保存失败');
  } else {
    uni.showModal({
      content: `${successCount.length}个文件保存成功,\n${
        urls.length - successCount.length
      }个文件保存失败`,
      showCancel: false,
    });
  }
};
