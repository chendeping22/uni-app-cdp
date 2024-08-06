import { default as pubSelected } from '@/app-platform/static/infos/pub-selected.svg';
import { default as pubSvg } from '@/app-platform/static/infos/pub.svg';
import { default as reviewSelectedSvg } from '@/app-platform/static/infos/review-selected.svg';
import { default as reviewSvg } from '@/app-platform/static/infos/review.svg';
import { map } from '@/utils/lodash-es';
import { request } from '@/utils/request';

export const formLabelStyle = { lineHeight: 1.375, fontSize: '32rpx', fontWeight: 400 };
export const formValueStyle = { lineHeight: 1.375, fontSize: '32rpx', fontWeight: 400 };
export const switchSizeStyle = { width: '116rpx', height: '60rpx' };

export const mapList = [
  [
    { name: '校园资讯', url: '/app-platform/infos/news/publish', category: 'news' },
    { name: '班级相册', url: '/app-platform/infos/album/publish', category: 'album' },
    { name: '班级视频', url: '/app-platform/infos/video/publish', category: 'video' },
  ],
  [{ name: '待审核' }, { name: '已通过' }, { name: '已驳回' }],
];

export const infosCategory = map(
  mapList[0] as { category: 'news' | 'album' | 'video' }[],
  l => l.category,
);

export const footList = [
  {
    iconPath: pubSvg,
    selectedIconPath: pubSelected,
    text: '发布管理',
  },
  {
    iconPath: reviewSvg,
    selectedIconPath: reviewSelectedSvg,
    text: '信息审核',
  },
];

export const actionList = [
  {
    text: '置顶',
    action: 'top',
    filter: 0,
  },
  {
    text: '取消置顶',
    action: 'cancelTop',
    filter: 1,
  },
  {
    text: '编辑',
    action: 'edit',
    filter: 4,
  },
  {
    text: '下线',
    action: 'offline',
    filter: 2,
  },
  {
    text: '上线',
    action: 'online',
    filter: 3,
  },
  {
    text: '删除',
    action: 'delete',
    filter: 5,
  },
];

export enum LOG_STATUS {
  /** 草稿 0*/
  daft = 0,
  /** 已发布 1 */
  publish,
  /** 定时未发布 2 */
  time_un_publish,
  /** 定时已发布 3 */
  time_publish,
  /** 下线 4 */
  offline,
  /** 审核中 5 */
  reviewing,
  /** 已驳回 6 */
  rejected,
  /** 校验中 */
  verifying,
  /** 校验失败 */
  verify_fail,
}

export const isCheckSwitch = () =>
  request('/publishCheckConfig', {}, 'GET', {
    spaceType: request.service.campus,
    defaultError: false,
  }).then((data: any) => {
    if (data && data.checkSwitch) {
      return true;
    }
    return false;
  });

/** 图片预览 */
export const handleClickImgs = (val?: any[], urlName?: string, index?: number) => {
  const urls = map(val || [], v => v?.[urlName || 'url']);
  if (val?.length) {
    uni.previewImage({
      urls,
      current: index ?? 0,
    });
  }
};

/** 顶部导航栏 按数组索引 */
export const TabBarIndexArr = mapList[0];

/** 事件组 */
export const EVENTS = {
  publish: 'on-publish',
};

export enum EnumStatusMap {
  review = 'review',
  verifying = 'verifying',
  verify_fail = 'verify_fail',
  top = 'top',
  timer = 'timer',
  down = 'down',
}

export const formatTagModes = (data: any, isNews?: boolean) => {
  const result: string[] = [];
  if (isNews) {
    /** 是否置顶 topDisplay */
    /** 是否定时 scheduledRelease */
    /** status
     * value: 0, label: '未发布',
     * value: 1, label: '已发布',
     * value: 4, label: '已下线',
     * value: 5, label: '审核中',
     * value: 6, label: '已驳回',
     * value: 7, label: '校验中',
     * value: 8, label: '校验失败',
     */
    if (data.publishStatus === LOG_STATUS.offline) {
      result.push(EnumStatusMap.down);
    } else if (data.publishStatus === LOG_STATUS.reviewing) {
      result.push(EnumStatusMap.review);
    }

    if (data.publishStatus === LOG_STATUS.verify_fail) {
      result.push(EnumStatusMap.verify_fail);
    }

    if (data.publishStatus === LOG_STATUS.verifying) {
      result.push(EnumStatusMap.verifying);
    }

    if (
      data.topDisplay === 1 &&
      data.publishStatus !== LOG_STATUS.offline &&
      data.publishStatus !== LOG_STATUS.reviewing
    ) {
      result.push(EnumStatusMap.top);
    }

    if (
      data.scheduledRelease &&
      (data.publishStatus == LOG_STATUS.time_un_publish ||
        data.publishStatus == LOG_STATUS.reviewing)
    ) {
      result.push(EnumStatusMap.timer);
    }
  } else {
    /** 待审核 */
    // waiting = 1,
    /** 已通过 */
    // approved = 2,
    /** 已驳回 */
    // rejected = 3,
    if (LOG_STATUS.reviewing === data.publishStatus) {
      result.push(EnumStatusMap.review);
    }

    if (data.publishStatus === LOG_STATUS.verify_fail) {
      result.push(EnumStatusMap.verify_fail);
    }

    if (data.publishStatus === LOG_STATUS.verifying) {
      result.push(EnumStatusMap.verifying);
    }
  }
  return result;
};
