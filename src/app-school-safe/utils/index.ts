import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export const uGetDom = (instance: any, selector: string) => {
  return new Promise<Required<UniApp.NodeInfo>>(resolve => {
    uni
      .createSelectorQuery()
      .in(instance)
      .select(selector)
      .boundingClientRect((ret: any) => {
        resolve(ret);
      })
      .exec();
  });
};

/**
 * 探测某个地址是否可可用
 * @param url
 * @param pingTimeLimit
 */
export const ping = (url?: string, pingTimeLimit = 3000) => {
  if (!url?.length) return false;
  const time = Date.now();
  const src = `${url}${url.endsWith('/') ? '' : '/'}favicon.ico?t=${time}`;

  return new Promise<boolean>(resolve => {
    uni.request({
      url: src,
      method: 'GET',
      timeout: pingTimeLimit,
      success: () => {
        resolve(true);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
};

/**
 * 时长格式化
 * @param seconds
 */
export const formatDuration = (seconds: number, format = 'HH:mm:ss') => {
  const date = dayjs.duration(seconds * 1000);
  return date.format(format);
};

/**
 * 时间间隔格式化 x年x月x日x时x分x秒
 * @param seconds
 */
export const formatDurationByDiffTime = (startTime: number, endTime: number) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  const duration = dayjs.duration(end.diff(start));

  const years = duration.years(),
    months = duration.months(),
    days = duration.days(),
    hours = duration.hours(),
    minutes = duration.minutes(),
    seconds = duration.seconds();

  let result = '';
  if (years > 0) {
    result += `${years}年`;
  }
  if (months > 0) {
    result += `${months}月`;
  }
  if (days > 0) {
    result += `${days}日`;
  }
  if (hours > 0) {
    result += `${hours}时`;
  }
  if (minutes > 0) {
    result += `${minutes}分`;
  }
  if (seconds > 0) {
    result += `${seconds}秒`;
  }

  return result;
};

/**
 * 递归树
 * @param treeData
 * @param callback
 */
export const traverseTree = (treeData: any[], callback: (node: any) => any) => {
  return treeData.map(node => {
    if (node.children?.length > 0) {
      node.children = traverseTree(node.children, callback);
    }
    return callback(node);
  });
};

/**
 * 过滤树节点
 * @param treeData
 * @param filterCallback
 * @returns
 */
export const filterTree = (treeData: any[], filterCallback: (node: any) => boolean) => {
  return treeData.filter(item => {
    const { children } = item;
    if (filterCallback(item)) return item;

    if (children && children.length) {
      const res = filterTree(children, filterCallback);
      if (res && res.length > 0) {
        item.children = res;
        return item;
      }
    }
  });
};

/**
 * 拉平树
 * @param treeData
 * @returns
 */
export const flatTree = (treeData: any[]) => {
  return treeData.reduce((res, item) => {
    const { children, ...i } = item;
    return res.concat(i, children && children.length ? flatTree(children) : []);
  }, []);
};
