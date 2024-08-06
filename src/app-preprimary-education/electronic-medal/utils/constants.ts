import iconBadge from '../../static/image/icon_badge.png';
import iconCrown from '../../static/image/icon_crown.png';
import iconDiamond from '../../static/image/icon_diamond.png';
import iconStar from '../../static/image/icon_star.png';

export interface CategoryListItem {
  id: string;
  name: string;
  medalInfoList: {
    id: string;
    name: string;
    icon: string;
    medalCount?: number;
    isRecently?: boolean;
    isSelect?: boolean;
  }[];
}

export interface ImageUrlType {
  [key: string]: string;
}

export const STAR_ICON = {
  star: iconStar,
  badge: iconBadge,
  diamond: iconDiamond,
  crown: iconCrown,
} as ImageUrlType;

/** 勋章 */
export const MEDAL_ACTIVE = {
  medal_sport:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_sport_active.png',
  medal_heart:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_heart_active.png',
  medal_environment:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_environment_active.png',
  medal_cup:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_cup_active.png',
  medal_sleep:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_sleep_active.png',
  medal_architect:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_architect_active.png',
  medal_scientist:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_scientist_active.png',
  medal_explore:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_explore_active.png',
  medal_improve:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_improve_active.png',
  medal_music:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_music_active.png',
  medal_story:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_story_active.png',
  medal_draw:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_draw_active.png',
  medal_independence:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_independence_active.png',
  medal_unknown:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_unknown_active.png',
} as ImageUrlType;

/** 未点亮勋章 */
export const MEDAL_DEFAULT = {
  medal_sport:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_sport_default.png',
  medal_heart:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_heart_default.png',
  medal_environment:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_environment_default.png',
  medal_cup:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_cup_default.png',
  medal_sleep:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_sleep_default.png',
  medal_architect:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_architect_default.png',
  medal_scientist:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_scientist_default.png',
  medal_explore:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_explore_default.png',
  medal_improve:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_improve_default.png',
  medal_music:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_music_default.png',
  medal_story:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_story_default.png',
  medal_draw:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_draw_default.png',
  medal_independence:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_independence_default.png',
  medal_unknown:
    'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/999/medal/medal_unknown_default.png',
} as ImageUrlType;
