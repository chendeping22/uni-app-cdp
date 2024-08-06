export function transformFileList(fileList) {
  let temp = null;
  try {
    temp = JSON.parse(fileList);
    temp = temp.map(one => {
      return JSON.parse(one);
    });
  } catch (error) {}
  return temp;
}

/**
 * 比较两个时间戳是否在几年之后
 */
export function isWithinYears(timestamp1, timestamp2, year = 2) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  // 获取两个日期之间的毫秒数差值
  const diffInMilliseconds = Math.abs(date1 - date2);

  // 将毫秒数转换为天数
  const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

  // 计算年份差值
  const diffInYears = diffInDays / 365;

  return diffInYears <= year;
}
