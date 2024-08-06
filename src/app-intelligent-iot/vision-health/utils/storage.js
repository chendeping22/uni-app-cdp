//设置缓存
export const setStorage = (key, value) => {
  const params = {
    date: new Date().getTime(),
    value,
  };
  uni.setStorageSync(key, JSON.stringify(params));
};

export const getStorage = (key, day) => {
  let obj = uni.getStorageSync(key);
  if (!obj) return null;
  try {
    obj = JSON.parse(obj);
    const date = new Date().getTime();
    if (date - obj.date > 86400000 * day) return null;
    return obj.value;
  } catch (e) {
    return null;
  }
};

export const removeStorage = (key) => {
  uni.removeStorageSync(key);
};
