/**
 * 检测上报提示
 * @param {Promise<any>} promise
 */
export const saveToast = async promise =>
  promise
    .then(res => {
      console.log('🚀 ~ 视力检测上报成功报文:', res);
      uni.hideLoading();
      uni.showToast({
        title: '上报成功',
        icon: 'success',
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    })
    .catch(err => {
      console.log('🚀 ~ 视力检测上报失败报文:', err);
      uni.hideLoading();
      if (err?.message) {
        uni.showToast({
          title: err?.message,
          icon: 'none',
          duration: 5000,
        });
      } else {
        uni.showToast({
          title: '上报失败',
          icon: 'error',
        });
      }
      setTimeout(() => {
        uni.navigateBack();
      }, 3000);
    });
