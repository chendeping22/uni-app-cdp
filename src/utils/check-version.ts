import { AppVersionData, getAppVersion } from '@/services/user';

// iOS/安卓更新操作
export const confirmUpdate = (versionRes: AppVersionData) => {
  if (plus.os.name === 'iOS') {
    plus.runtime.launchApplication(
      {
        action: 'https://apps.apple.com/cn/app/id1609380492',
      },
      function (e) {
        console.log('Open system default browser failed: ' + e.message);
      },
    );
  } else {
    const url = versionRes.url;
    plus.runtime.openURL(url);
  }
};

export const checkAppVersion = (isFromAboutPage?: boolean, showLoading = true) => {
  const hasNotNewVersion = function () {
    uni.setStorage({
      key: 'hasNewVersion',
      data: false,
    });
    uni.$emit('check-new-version');
    if (isFromAboutPage) {
      uni.showModal({
        title: '提示',
        content: '当前已是最新版本',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#176bfb',
        success: function (res) {
          if (res.confirm) {
            console.log('---点击确定---');
            uni.setStorage({
              key: 'hasNewVersion',
              data: false,
            });
            uni.$emit('check-new-version');
          }
        },
      });
    }
  };

  getAppVersion(
    {
      appName: import.meta.env.VITE_APP_NAME,
      terminal: plus.os.name === 'iOS' ? 2 : 1,
    },
    showLoading,
  ).then((versionRes: AppVersionData) => {
    if (versionRes !== null) {
      const ignoreVersion = uni.getStorageSync('ignoreVersion');
      if (versionRes.version === ignoreVersion) return;

      const tempVersion = plus.runtime.version;
      const currentVersion: string =
        tempVersion !== undefined && tempVersion.length !== 0
          ? (plus.runtime.version as string)
          : '1.0.0';
      const resVersionNums = versionRes.version.split('.');
      const currentVersionNums = currentVersion.split('.');
      const showVersionDialog = () => {
        uni.setStorage({
          key: 'hasNewVersion',
          data: true,
        });
        uni.$emit('check-new-version');

        if (versionRes.forced) {
          const res = encodeURIComponent(JSON.stringify(versionRes));
          uni.reLaunch({
            url: `/app-platform/mine/check-update/index?versionRes=${res}`,
          });
          return;
        } else if (!isFromAboutPage && !versionRes.popUp) {
          console.log('有新版本，不弹窗提醒');
          return;
        }

        uni.showModal({
          title: `新版本V${versionRes.version}`,
          content: versionRes.content,
          showCancel: !versionRes.forced,
          cancelText: '暂不更新',
          cancelColor: '#181944',
          confirmText: '立即更新',
          confirmColor: '#4966F5',
          success: function (res) {
            if (res.confirm) {
              confirmUpdate(versionRes);
            } else if (res.cancel) {
              // 存储至storage
              uni.setStorage({
                key: 'ignoreVersion',
                data: versionRes.version,
              });
            }
          },
        });
      };

      if (Number(resVersionNums[0]) > Number(currentVersionNums[0])) {
        showVersionDialog();
        return;
      } else if (Number(resVersionNums[0]) === Number(currentVersionNums[0])) {
        if (Number(resVersionNums[1]) > Number(currentVersionNums[1])) {
          showVersionDialog();
          return;
        } else if (Number(resVersionNums[1]) === Number(currentVersionNums[1])) {
          if (Number(resVersionNums[2]) > Number(currentVersionNums[2])) {
            showVersionDialog();
            return;
          }
        }
      }

      hasNotNewVersion();
    } else {
      hasNotNewVersion();
    }
  });
};
