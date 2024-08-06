// 查询android系统权限
export const requestAndroidPermission = (permissionID: string) => {
  return new Promise(resolve => {
    plus.android.requestPermissions(
      [permissionID], // 理论上支持多个权限同时查询，但实际上本函数封装只处理了一个权限的情况。有需要的可自行扩展封装
      resultObj => {
        let result = 0;
        for (let i = 0; i < resultObj.granted.length; i++) {
          console.log('已获取的权限：' + resultObj.granted[i]);
          result = 1;
        }
        for (let i = 0; i < resultObj.deniedPresent.length; i++) {
          console.log('拒绝本次申请的权限：' + resultObj.deniedPresent[i]);
          result = 0;
        }
        for (let i = 0; i < resultObj.deniedAlways.length; i++) {
          console.log('永久拒绝申请的权限：' + resultObj.deniedAlways[i]);
          result = -1;
        }
        resolve(result);
      },
      error => {
        resolve({
          code: error.code,
          message: error.message,
        });
      },
    );
  });
};

// 查询ios系统权限
export const requestIOSPermission = (permissionID: string) => {
  return new Promise(resolve => {
    switch (permissionID) {
      case 'record':
        resolve(judgeIosPermissionRecord());
        break;
      default:
        resolve(0);
        break;
    }
  });
};

// 判断IOS录音权限是否开启
export const judgeIosPermissionRecord = () => {
  let result = null;
  const avaudiosession = plus.ios.import('AVAudioSession');
  const avaudio = avaudiosession.sharedInstance();
  const status = avaudio.recordPermission();
  console.log('permissionStatus:' + status);
  if (status === 1970168948) {
    result = null;
  } else if (status === 1735552628) {
    result = 1;
  } else {
    result = 0;
  }
  plus.ios.deleteObject(avaudiosession);
  return result;
};

// 打开系统权限设置
export const gotoAppPermissionSetting = () => {
  const isIOS = uni.getSystemInfoSync().platform === 'ios';
  if (isIOS) {
    const UIApplication = plus.ios.import('UIApplication');
    const application2 = UIApplication.sharedApplication();
    const NSURL2 = plus.ios.import('NSURL');
    const setting2 = NSURL2.URLWithString('app-settings:');
    application2.openURL(setting2);
    plus.ios.deleteObject(setting2);
    plus.ios.deleteObject(NSURL2);
    plus.ios.deleteObject(application2);
  } else {
    const Intent = plus.android.importClass('android.content.Intent');
    const Settings = plus.android.importClass('android.provider.Settings');
    const Uri = plus.android.importClass('android.net.Uri');
    const mainActivity = plus.android.runtimeMainActivity();
    const intent = new Intent();
    intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    const uri = Uri.fromParts('package', mainActivity.getPackageName(), null);
    intent.setData(uri);
    mainActivity.startActivity(intent);
  }
};
