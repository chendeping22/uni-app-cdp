// export const saveToast = async (promise) =>
//   promise
//     .then((res) => {
//       uni.hideLoading();
//       uni.showToast({
//         title: '上报成功',
//         icon: 'success',
//       });
//       setTimeout(() => {
//         uni.navigateBack();
//       }, 1000);
//     })
//     .catch((err) => {
//       uni.hideLoading();
//       if (err?.message) {
//         uni.showToast({
//           title: err?.message,
//           icon: 'none',
//           duration: 5000,
//         });
//       } else {
//         uni.showToast({
//           title: '上报失败',
//           icon: 'error',
//         });
//       }
//     });

import $http from '@/app-intelligent-iot/vision-collect/api';

export const loginEvent = tel => {
  let data = {
    mobile: tel,
  };
  $http.kangRui
    .loginEvent(data)
    .then(res2 => {})
    .catch(err => {
      uni.showToast({
        title: err.desc,
        icon: 'none',
      });
    });
};
