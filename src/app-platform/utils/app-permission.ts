// #ifdef APP-PLUS
export const judgeIosPermissionCamera = () => {
  let result = false;
  const AVCaptureDevice = plus.ios.import('AVCaptureDevice');
  const authStatus = AVCaptureDevice.authorizationStatusForMediaType('vide');
  if (authStatus == 3) {
    result = true;
  }
  plus.ios.deleteObject(AVCaptureDevice);
  return result;
};

// 判断相册权限是否开启
export const judgeIosPermissionPhotoLibrary = () => {
  let result = false;
  const PHPhotoLibrary = plus.ios.import('PHPhotoLibrary');
  const authStatus = PHPhotoLibrary.authorizationStatus();
  console.log('authStatus:' + authStatus);
  if (authStatus == 3) {
    result = true;
  } else {
  }
  plus.ios.deleteObject(PHPhotoLibrary);
  return result;
};

export const requestAndroidPermission = (permissionID: string) => {
  return new Promise(resolve => {
    plus.android.requestPermissions(
      [permissionID], // 理论上支持多个权限同时查询，但实际上本函数封装只处理了一个权限的情况。有需要的可自行扩展封装
      function (resultObj) {
        let result = 0;
        for (let i = 0; i < resultObj.granted.length; i++) {
          result = 1;
        }
        for (let i = 0; i < resultObj.deniedPresent.length; i++) {
          result = 0;
        }
        for (let i = 0; i < resultObj.deniedAlways.length; i++) {
          result = -1;
        }
        resolve(result);
      },
      function (error) {
        resolve({
          code: error.code,
          message: error.message,
        });
      },
    );
  });
};

export const judgeAndroidPermissionCamera = () =>
  requestAndroidPermission('android.permission.CAMERA').then(res => res === 1);

// 外部存储(含相册)读取权限
export const judgeAndroidPermissionPhotoLibrary = () =>
  requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE').then(res => res === 1);

// #endif
