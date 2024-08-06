/**
 * 检测上报提示
 * @param {Promise<any>} promise
 */
export const saveToast = async (promise) =>
  promise
    .then((res) => {
      uni.hideLoading();
      uni.showToast({
        title: '上报成功',
        icon: 'success',
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    })
    .catch((err) => {
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
    });
