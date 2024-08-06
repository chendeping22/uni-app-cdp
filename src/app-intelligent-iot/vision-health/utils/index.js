import validate from '@/app-intelligent-iot/vision-health/utils/validate.js';

const publicFunc = {
  // 节流
  btnFunc(func, limit) {
    let Timer;
    let lastRanTime;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRanTime) {
        // 第一次调用
        func.apply(context, args); // 直接传参执行原函数
        lastRanTime = Date.now(); // 并记录执行时间
      } else {
        clearTimeout(Timer); // 清除上次调用
        Timer = setTimeout(function () {
          // 保存这次调用的引用
          if (Date.now() - lastRanTime >= limit) {
            func.apply(context, args);
            lastRanTime = Date.now();
          }
        }, limit - (Date.now() - lastRanTime)); // 保证每一个 limit 时间段内的最后一次调用都会执行
      }
    };
  },
  // Toast提示
  showToast(icon, content, time = 3000) {
    uni.showToast({
      icon: icon, //success/fail/none
      title: content,
      duration: time,
    });
  },
  // 开启加载框
  showLoading(content = '加载中...', mask = true) {
    uni.showLoading({
      title: content,
      mask: mask,
    });
  },
  // 关闭加载框
  hideLoading(timer = 0) {
    if (timer > 0) {
      let t = setTimeout(function () {
        uni.hideLoading();
        clearTimeout(t);
      }, timer);
    } else {
      uni.hideLoading();
    }
  },
  // 数据校验
  validateForm(form, rules) {
    return new Promise((resolve, reject) => {
      const validateRes = validate.validate(form, rules);
      if (validateRes.isOk) {
        resolve(validateRes);
      } else {
        this.showToast('none', validateRes.errmsg);
        reject(validateRes);
      }
    });
  },
};

export const getPublicFuncProxy = () => ({
  proxy: {
    $publicFunc: publicFunc,
  },
});

export default publicFunc;
