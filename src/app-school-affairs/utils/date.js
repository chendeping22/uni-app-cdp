const dateFormat = (fmt, date) => {
  let ret;
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'M+': (date.getMonth() + 1).toString(), // 月
    'D+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'm+': date.getMinutes().toString(), // 分
    's+': date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
    }
  }
  return fmt;
};

/**
 *
 * @param dateNow :Date类
 * @param intervalDays ：间隔天数
 * @param bolPastTime  ：Boolean,判断在参数date之前，还是之后，
 */
const getDateRange = (dateNow, intervalDays, bolPastTime, format = 'YYYY-MM-DD') => {
  let oneDayTime = 24 * 60 * 60 * 1000;
  let list = [];
  let lastDay;

  if (bolPastTime == true) {
    lastDay = new Date(dateNow.getTime() - intervalDays * oneDayTime);
    list.push(dateFormat(format, lastDay));
    list.push(dateFormat(format, dateNow));
  } else {
    lastDay = new Date(dateNow.getTime() + intervalDays * oneDayTime);
    list.push(dateFormat(format, dateNow));
    list.push(dateFormat(format, lastDay));
  }
  return list;
};

export { dateFormat, getDateRange };
